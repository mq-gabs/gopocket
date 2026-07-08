package transaction

import (
	"gopocket/internal/category"
	"gopocket/models"
)

// Transaction represents a financial transaction stored in the database.
type Transaction struct {
	models.BaseModel
	Title       string            `gorm:"size:255;not null"`
	Description string            `gorm:"type:text"`
	Amount      int               `gorm:"not null"`
	Type        TransactionType   `gorm:"type:text;not null"`
	CategoryID  string            `gorm:"type:text;not null;index"`
	Category    category.Category `gorm:"foreignKey:CategoryID;references:ID"`
}

// TransactionType defines the supported transaction kinds.
type TransactionType string

const (
	TransactionTypeExpense TransactionType = "EXPENSE"
	TransactionTypeIncome  TransactionType = "INCOME"
)
