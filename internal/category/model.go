package category

import "gopocket/models"

// Category represents a finance category stored in the database.
type Category struct {
	models.BaseModel
	Name  string       `gorm:"size:255;not null"`
	Color string       `gorm:"size:50"`
	Icon  string       `gorm:"size:50"`
	Type  CategoryType `gorm:"type:text;not null"`
}

// CategoryType defines the supported category kinds.
type CategoryType string

const (
	CategoryTypeExpense CategoryType = "EXPENSE"
	CategoryTypeIncome  CategoryType = "INCOME"
)
