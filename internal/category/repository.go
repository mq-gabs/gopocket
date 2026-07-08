package category

import "gorm.io/gorm"

// Repository persists categories in the database.
type Repository interface {
	Create(category *Category) (*Category, error)
	FindByID(id string) (*Category, error)
	FindAll() ([]Category, error)
	Update(category *Category) (*Category, error)
	Delete(id string) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a category repository using constructor injection.
func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(category *Category) (*Category, error) {
	if err := r.db.Create(category).Error; err != nil {
		return nil, err
	}
	return category, nil
}

func (r *repository) FindByID(id string) (*Category, error) {
	var category Category
	if err := r.db.First(&category, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *repository) FindAll() ([]Category, error) {
	var categories []Category
	if err := r.db.Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *repository) Update(category *Category) (*Category, error) {
	if err := r.db.Save(category).Error; err != nil {
		return nil, err
	}
	return category, nil
}

func (r *repository) Delete(id string) error {
	result := r.db.Delete(&Category{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
