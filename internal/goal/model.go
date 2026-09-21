package goal

import (
	"gopocket/internal/transaction"
	"gopocket/models"
	"time"
)

// Goal is an objective with a target amount (e.g. saving for something, or
// tracking the payment of installments). Transactions are linked through the
// goal_transactions join table: paid ones count as accomplished, planned
// (unpaid) ones as committed. DueAt is nil for goals with no deadline.
type Goal struct {
	models.BaseModel
	Name         string                    `gorm:"size:255;not null"`
	Description  string                    `gorm:"type:text"`
	TotalAmount  int                       `gorm:"not null"`
	DueAt        *time.Time                `gorm:"index"`
	Transactions []transaction.Transaction `gorm:"many2many:goal_transactions;"`
}
