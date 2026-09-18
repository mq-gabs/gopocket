package transaction

import (
	"time"

	"gopocket/internal/category"

	"gorm.io/gorm"
)

// TransactionFilter represents parsed filter criteria applied when listing
// transactions. StartDate/EndDate are matched against paid_at for actual
// transactions and due_at for planned ones.
type TransactionFilter struct {
	Search      string
	CategoryIDs []string
	Type        string
	StartDate   *time.Time
	EndDate     *time.Time
}

// Repository persists transactions in the database.
type Repository interface {
	Create(transaction *Transaction, categoryIDs []string) (*Transaction, error)
	Update(transaction *Transaction, categoryIDs []string) (*Transaction, error)
	Delete(id string) error
	DeleteMany(ids []string) error
	MarkManyPaid(ids []string, paidAt time.Time) error
	FindByID(id string) (*Transaction, error)

	FindAllActual(filter TransactionFilter) ([]Transaction, error)
	FindActualForPeriod(start, end time.Time) ([]Transaction, error)

	FindAllPlanned(filter TransactionFilter) ([]Transaction, error)
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a transaction repository using constructor injection.
func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(transaction *Transaction, categoryIDs []string) (*Transaction, error) {
	if err := r.db.Omit("Categories").Create(transaction).Error; err != nil {
		return nil, err
	}

	if err := r.setCategories(transaction, categoryIDs); err != nil {
		return nil, err
	}

	return transaction, nil
}

func (r *repository) Update(transaction *Transaction, categoryIDs []string) (*Transaction, error) {
	if err := r.db.Omit("Categories").Save(transaction).Error; err != nil {
		return nil, err
	}

	// A nil slice means category_ids was omitted from the request, so the
	// existing associations are left untouched (e.g. marking a transaction
	// as paid should not clear its categories).
	if categoryIDs != nil {
		if err := r.setCategories(transaction, categoryIDs); err != nil {
			return nil, err
		}
	}

	return r.FindByID(transaction.ID)
}

// setCategories replaces a transaction's category associations, looking up
// the existing category records so their own fields are never overwritten.
func (r *repository) setCategories(transaction *Transaction, categoryIDs []string) error {
	var categories []category.Category
	if len(categoryIDs) > 0 {
		if err := r.db.Where("id IN ?", categoryIDs).Find(&categories).Error; err != nil {
			return err
		}
	}

	if err := r.db.Model(transaction).Association("Categories").Replace(categories); err != nil {
		return err
	}

	transaction.Categories = categories
	return nil
}

func (r *repository) Delete(id string) error {
	result := r.db.Delete(&Transaction{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *repository) DeleteMany(ids []string) error {
	result := r.db.Delete(&Transaction{}, "id IN ?", ids)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *repository) MarkManyPaid(ids []string, paidAt time.Time) error {
	result := r.db.Model(&Transaction{}).Where("id IN ?", ids).Update("paid_at", paidAt)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *repository) FindByID(id string) (*Transaction, error) {
	var transaction Transaction
	if err := r.db.Preload("Categories").First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

// ACTUAL

func (r *repository) FindAllActual(filter TransactionFilter) ([]Transaction, error) {
	var transactions []Transaction
	query := r.applyFilter(withActual(r.db), filter, "paid_at")
	if err := query.Preload("Categories").Order("paid_at DESC").Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

func (r *repository) FindActualForPeriod(start, end time.Time) ([]Transaction, error) {
	var transactions []Transaction
	query := "COALESCE(NULLIF(paid_at, ?), created_at) >= ? AND COALESCE(NULLIF(paid_at, ?), created_at) < ?"
	if err := withActual(r.db).Preload("Categories").Where(query, time.Time{}, start, time.Time{}, end).Order("COALESCE(NULLIF(paid_at, created_at), created_at) DESC").Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

// PLANNED

func (r *repository) FindAllPlanned(filter TransactionFilter) ([]Transaction, error) {
	var transactions []Transaction
	query := r.applyFilter(withPlanned(r.db), filter, "due_at")
	if err := query.Preload("Categories").Order("due_at ASC").Find(&transactions).Error; err != nil {
		return nil, err
	}

	return transactions, nil
}

// UTILS

func withActual(tx *gorm.DB) *gorm.DB {
	return tx.Where("paid_at IS NOT NULL")
}

func withPlanned(tx *gorm.DB) *gorm.DB {
	return tx.Where("paid_at IS NULL")
}

// applyFilter narrows a transaction query by the given filter criteria.
// dateColumn selects which column (paid_at or due_at) the date range matches.
func (r *repository) applyFilter(tx *gorm.DB, filter TransactionFilter, dateColumn string) *gorm.DB {
	if filter.Search != "" {
		like := "%" + filter.Search + "%"
		tx = tx.Where("title LIKE ? OR description LIKE ?", like, like)
	}
	if filter.Type != "" {
		tx = tx.Where("type = ?", filter.Type)
	}
	if len(filter.CategoryIDs) > 0 {
		tx = tx.Where(
			"id IN (?)",
			r.db.Table("transaction_categories").
				Select("transaction_id").
				Where("category_id IN ?", filter.CategoryIDs),
		)
	}
	if filter.StartDate != nil {
		tx = tx.Where(dateColumn+" >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		tx = tx.Where(dateColumn+" <= ?", *filter.EndDate)
	}
	return tx
}
