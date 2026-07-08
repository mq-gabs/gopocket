package category

import (
	"gopocket/internal/transaction/transactiontype"
	"gopocket/models"
)

// Category represents a finance category stored in the database.
type Category struct {
	models.BaseModel
	Name  string                          `gorm:"size:255;not null"`
	Color string                          `gorm:"size:50"`
	Icon  string                          `gorm:"size:50"`
	Type  transactiontype.TransactionType `gorm:"type:text;not null"`
}
