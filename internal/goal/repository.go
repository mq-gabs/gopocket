package goal

import (
	"errors"

	"gopocket/internal/transaction"
	"gopocket/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ErrGoalsNotFound is returned when none of the requested goals exist.
var ErrGoalsNotFound = errors.New("goals not found")

// ErrTransactionsNotFound is returned when none of the requested transactions exist.
var ErrTransactionsNotFound = errors.New("transactions not found")

// Repository persists goals and their transaction links in the database.
type Repository interface {
	Create(goal *Goal) (*Goal, error)
	Update(goal *Goal) (*Goal, error)
	Delete(id string) error
	FindByID(id string) (*Goal, error)
	FindAll() ([]Goal, error)

	FindTransactions(goalID string) ([]transaction.Transaction, error)
	LinkTransactions(goalIDs []string, transactionIDs []string) error
	UnlinkTransaction(goalID string, transactionID string) error

	FindGoalIDsByTransaction(transactionID string) ([]string, error)
	SetTransactionGoals(transactionID string, goalIDs []string) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a goal repository using constructor injection.
func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(goal *Goal) (*Goal, error) {
	if err := r.db.Omit("Transactions").Create(goal).Error; err != nil {
		return nil, err
	}
	return goal, nil
}

func (r *repository) Update(goal *Goal) (*Goal, error) {
	if err := r.db.Omit("Transactions").Save(goal).Error; err != nil {
		return nil, err
	}
	return goal, nil
}

func (r *repository) Delete(id string) error {
	result := r.db.Delete(&Goal{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// FindByID loads a goal with its linked transactions (needed to compute its
// progress). Soft-deleted transactions are skipped automatically.
func (r *repository) FindByID(id string) (*Goal, error) {
	var goal Goal
	if err := r.db.Preload("Transactions").First(&goal, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &goal, nil
}

// FindAll lists goals with their linked transactions: soonest deadline first,
// goals without a deadline last, oldest first within each group.
func (r *repository) FindAll() ([]Goal, error) {
	var goals []Goal
	if err := r.db.Preload("Transactions").
		Order("due_at IS NULL, due_at ASC, created_at ASC").
		Find(&goals).Error; err != nil {
		return nil, err
	}
	return goals, nil
}

// FindTransactions lists the transactions linked to a goal: paid ones first
// (most recent payment first), then planned ones by due date.
func (r *repository) FindTransactions(goalID string) ([]transaction.Transaction, error) {
	var transactions []transaction.Transaction
	err := r.db.Preload("Categories").
		Where("id IN (?)", r.db.Table("goal_transactions").Select("transaction_id").Where("goal_id = ?", goalID)).
		Order("paid_at DESC, due_at ASC").
		Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

// LinkTransactions links each of the given transactions to each of the given
// goals, skipping links that already exist so no duplicate row is created.
func (r *repository) LinkTransactions(goalIDs []string, transactionIDs []string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var goals []Goal
		if err := tx.Preload("Transactions").Where("id IN ?", goalIDs).Find(&goals).Error; err != nil {
			return err
		}
		if len(goals) == 0 {
			return ErrGoalsNotFound
		}

		var transactions []transaction.Transaction
		if err := tx.Where("id IN ?", transactionIDs).Find(&transactions).Error; err != nil {
			return err
		}
		if len(transactions) == 0 {
			return ErrTransactionsNotFound
		}

		for i := range goals {
			linked := make(map[string]bool, len(goals[i].Transactions))
			for _, existing := range goals[i].Transactions {
				linked[existing.ID] = true
			}

			var toAppend []transaction.Transaction
			for _, candidate := range transactions {
				if !linked[candidate.ID] {
					toAppend = append(toAppend, candidate)
				}
			}

			if len(toAppend) == 0 {
				continue
			}

			if err := tx.Model(&goals[i]).Association("Transactions").Append(toAppend); err != nil {
				return err
			}
		}

		return nil
	})
}

// UnlinkTransaction removes the link between a goal and a transaction. The
// transaction itself is untouched.
func (r *repository) UnlinkTransaction(goalID string, transactionID string) error {
	var goal Goal
	if err := r.db.First(&goal, "id = ?", goalID).Error; err != nil {
		return err
	}

	return r.db.Model(&goal).Association("Transactions").Delete(&transaction.Transaction{
		BaseModel: models.BaseModel{ID: transactionID},
	})
}

// goalTransaction is a row of the goal_transactions join table, declared only
// to write to it directly (the schema itself comes from Goal's many2many).
type goalTransaction struct {
	GoalID        string `gorm:"column:goal_id;primaryKey"`
	TransactionID string `gorm:"column:transaction_id;primaryKey"`
}

func (goalTransaction) TableName() string { return "goal_transactions" }

func (r *repository) transactionExists(tx *gorm.DB, transactionID string) error {
	var count int64
	if err := tx.Model(&transaction.Transaction{}).Where("id = ?", transactionID).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		return ErrTransactionsNotFound
	}
	return nil
}

// FindGoalIDsByTransaction lists the ids of the (non-deleted) goals a
// transaction is linked to.
func (r *repository) FindGoalIDsByTransaction(transactionID string) ([]string, error) {
	if err := r.transactionExists(r.db, transactionID); err != nil {
		return nil, err
	}

	ids := []string{}
	err := r.db.Model(&Goal{}).
		Where("id IN (?)", r.db.Table("goal_transactions").Select("goal_id").Where("transaction_id = ?", transactionID)).
		Pluck("id", &ids).Error
	if err != nil {
		return nil, err
	}
	return ids, nil
}

// SetTransactionGoals makes the given goals the transaction's complete set of
// goals: links to goals not listed are removed, missing links are added, and
// links that already exist are kept. Ids that match no goal are ignored, but
// a non-empty list matching none at all is an error.
func (r *repository) SetTransactionGoals(transactionID string, goalIDs []string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := r.transactionExists(tx, transactionID); err != nil {
			return err
		}

		var keepIDs []string
		if len(goalIDs) > 0 {
			if err := tx.Model(&Goal{}).Where("id IN ?", goalIDs).Pluck("id", &keepIDs).Error; err != nil {
				return err
			}
			if len(keepIDs) == 0 {
				return ErrGoalsNotFound
			}
		}

		remove := tx.Where("transaction_id = ?", transactionID)
		if len(keepIDs) > 0 {
			remove = remove.Where("goal_id NOT IN ?", keepIDs)
		}
		if err := remove.Delete(&goalTransaction{}).Error; err != nil {
			return err
		}

		if len(keepIDs) == 0 {
			return nil
		}

		rows := make([]goalTransaction, 0, len(keepIDs))
		for _, goalID := range keepIDs {
			rows = append(rows, goalTransaction{GoalID: goalID, TransactionID: transactionID})
		}
		return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&rows).Error
	})
}
