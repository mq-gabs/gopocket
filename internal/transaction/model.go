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
	Title           string                          `gorm:"size:255;not null"`
	Description     string                          `gorm:"type:text"`
	Amount          int                             `gorm:"not null"`
	Type            transactiontype.TransactionType `gorm:"type:text;not null"`
	CategoryID      string                          `gorm:"type:text;not null;index"`
	TransactionDate time.Time                       `gorm:"index"`
	Category        category.Category               `gorm:"foreignKey:CategoryID;references:ID"`
}
