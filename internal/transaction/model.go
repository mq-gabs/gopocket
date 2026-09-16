package transaction

import (
	"gopocket/internal/category"
	"gopocket/internal/transaction/transactiontype"
	"gopocket/models"
	"time"
)

// Transaction represents a financial transaction stored in the database.
type Transaction struct {
	models.BaseModel
	Title       string                          `gorm:"size:255;not null"`
	Description string                          `gorm:"type:text"`
	Amount      int                             `gorm:"not null"`
	Type        transactiontype.TransactionType `gorm:"type:text;not null"`
	Categories  []category.Category             `gorm:"many2many:transaction_categories;"`
	PaidAt      *time.Time                      `gorm:"index"`
	DueAt       time.Time                       `gorm:"index"`
}
