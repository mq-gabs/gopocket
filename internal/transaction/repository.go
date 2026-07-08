package transaction

import "gorm.io/gorm"

// Repository persists transactions in the database.
type Repository interface {
	Create(transaction *Transaction) (*Transaction, error)
	FindByID(id string) (*Transaction, error)
	FindAll() ([]Transaction, error)
	Update(transaction *Transaction) (*Transaction, error)
	Delete(id string) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a transaction repository using constructor injection.
func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(transaction *Transaction) (*Transaction, error) {
	if err := r.db.Create(transaction).Error; err != nil {
		return nil, err
	}
	return transaction, nil
}

func (r *repository) FindByID(id string) (*Transaction, error) {
	var transaction Transaction
	if err := r.db.First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *repository) FindAll() ([]Transaction, error) {
	var transactions []Transaction
	if err := r.db.Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

func (r *repository) Update(transaction *Transaction) (*Transaction, error) {
	if err := r.db.Save(transaction).Error; err != nil {
		return nil, err
	}
	return transaction, nil
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
