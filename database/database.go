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

	if err := migrateLegacyCategoryColumn(db); err != nil {
		return nil, err
	}

	return db, nil
}

// migrateLegacyCategoryColumn copies data from the old single category_id
// column (before transactions supported multiple categories) into the
// transaction_categories join table, then drops the now-unused column.
func migrateLegacyCategoryColumn(db *gorm.DB) error {
	if !db.Migrator().HasColumn(&transaction.Transaction{}, "category_id") {
		return nil
	}

	if err := db.Exec(`
		INSERT OR IGNORE INTO transaction_categories (transaction_id, category_id)
		SELECT id, category_id FROM transactions
		WHERE category_id IS NOT NULL AND category_id != ''
	`).Error; err != nil {
		return err
	}

	if db.Migrator().HasConstraint(&transaction.Transaction{}, "fk_transactions_category") {
		if err := db.Migrator().DropConstraint(&transaction.Transaction{}, "fk_transactions_category"); err != nil {
			return err
		}
	}

	return db.Migrator().DropColumn(&transaction.Transaction{}, "category_id")
}
