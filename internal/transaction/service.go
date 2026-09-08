package transaction

import (
	"errors"
	"gopocket/internal/transaction/transactiontype"
)

// Service encapsulates transaction business logic.
type Service interface {
	Create(dto CreateTransactionRequest) (*Transaction, error)
	FindByID(id string) (*Transaction, error)
	FindAll() ([]Transaction, error)
	Update(id string, dto UpdateTransactionRequest) (*Transaction, error)
	Delete(id string) error
	Dashboard(query DashboardQuery) (*DashboardResponse, error)
}

type service struct {
	repository Repository
}

// NewService wires a transaction service with its repository.
func NewService(repository Repository) Service {
	return &service{repository: repository}
}

func (s *service) Create(dto CreateTransactionRequest) (*Transaction, error) {
	model := CreateRequestToModel(dto)
	return s.repository.Create(&model)
}

func (s *service) FindByID(id string) (*Transaction, error) {
	return s.repository.FindByID(id)
}

func (s *service) FindAll() ([]Transaction, error) {
	return s.repository.FindAll()
}

func (s *service) Update(id string, dto UpdateTransactionRequest) (*Transaction, error) {
	model, err := s.repository.FindByID(id)
	if err != nil {
		return nil, err
	}
	if dto.Title != "" {
		model.Title = dto.Title
	}
	if dto.Description != "" {
		model.Description = dto.Description
	}
	if dto.Amount != 0 {
		model.Amount = dto.Amount
	}
	if dto.Type != "" {
		model.Type = transactiontype.TransactionType(dto.Type)
	}
	if dto.CategoryID != "" {
		model.CategoryID = dto.CategoryID
	}
	if dto.TransactionDate != "" {
		model.TransactionDate = parseTransactionDate(dto.TransactionDate)
	}
	return s.repository.Update(model)
}

func (s *service) Delete(id string) error {
	if id == "" {
		return errors.New("transaction id is required")
	}
	return s.repository.Delete(id)
}
