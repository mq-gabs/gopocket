package database

import (
	"gopocket/internal/category"
	"gopocket/internal/transaction"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// New opens a SQLite database and auto-migrates the registered models.
func New(path string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(&category.Category{}, &transaction.Transaction{}); err != nil {
		return nil, err
	}

	return db, nil
}
