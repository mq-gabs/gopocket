package category

import (
	"errors"
	"gopocket/internal/transaction/transactiontype"
)

// Service encapsulates category business logic.
type Service interface {
	Create(dto CreateCategoryRequest) (*Category, error)
	FindByID(id string) (*Category, error)
	FindAll() ([]Category, error)
	Update(id string, dto UpdateCategoryRequest) (*Category, error)
	Delete(id string) error
}

type service struct {
	repository Repository
}

// NewService wires a category service with its repository.
func NewService(repository Repository) Service {
	return &service{repository: repository}
}

func (s *service) Create(dto CreateCategoryRequest) (*Category, error) {
	model := CreateRequestToModel(dto)
	return s.repository.Create(&model)
}

func (s *service) FindByID(id string) (*Category, error) {
	return s.repository.FindByID(id)
}

func (s *service) FindAll() ([]Category, error) {
	return s.repository.FindAll()
}

func (s *service) Update(id string, dto UpdateCategoryRequest) (*Category, error) {
	model, err := s.repository.FindByID(id)
	if err != nil {
		return nil, err
	}
	if dto.Name != "" {
		model.Name = dto.Name
	}
	if dto.Color != "" {
		model.Color = dto.Color
	}
	if dto.Icon != "" {
		model.Icon = dto.Icon
	}
	if dto.Type != "" {
		model.Type = transactiontype.TransactionType(dto.Type)
	}
	return s.repository.Update(model)
}

func (s *service) Delete(id string) error {
	if id == "" {
		return errors.New("category id is required")
	}
	return s.repository.Delete(id)
}
