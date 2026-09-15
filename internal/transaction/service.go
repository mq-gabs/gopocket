package transaction

import (
	"errors"
	"gopocket/internal/transaction/transactiontype"
)

// Service encapsulates transaction business logic.
type Service interface {
	Update(id string, dto UpdateTransactionRequest) (*Transaction, error)
	Delete(id string) error
	FindByID(id string) (*Transaction, error)

	Dashboard(query DashboardQuery) (*DashboardResponse, error)

	CreateActual(dto CreateActualTransactionRequest) (*Transaction, error)
	FindAllActual() ([]Transaction, error)

	CreatePlanned(dto CreatePlannedTransactionRequest) (*Transaction, error)
	FindAllPlanned() ([]Transaction, error)
}

type service struct {
	repository Repository
}

// NewService wires a transaction service with its repository.
func NewService(repository Repository) Service {
	return &service{repository: repository}
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
	if dto.PaidAt != "" {
		model.PaidAt = parseTransactionDate(dto.PaidAt)
	}
	return s.repository.Update(model)
}

func (s *service) Delete(id string) error {
	if id == "" {
		return errors.New("transaction id is required")
	}
	return s.repository.Delete(id)
}

func (s *service) FindByID(id string) (*Transaction, error) {
	return s.repository.FindByID(id)
}

// ACTUAL

func (s *service) CreateActual(dto CreateActualTransactionRequest) (*Transaction, error) {
	model := CreateActualRequestToModel(dto)
	return s.repository.Create(&model)
}

func (s *service) FindAllActual() ([]Transaction, error) {
	return s.repository.FindAllActual()
}

// PLANNED
func (s *service) CreatePlanned(dto CreatePlannedTransactionRequest) (*Transaction, error) {
	model := CreatePlannedRequestToModel(dto)
	return s.repository.Create(&model)
}

func (s *service) FindAllPlanned() ([]Transaction, error) {
	return s.repository.FindAllPlanned()
}
