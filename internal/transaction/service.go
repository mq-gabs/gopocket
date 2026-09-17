package transaction

import (
	"errors"
	"gopocket/internal/transaction/transactiontype"
)

// Service encapsulates transaction business logic.
type Service interface {
	Update(id string, dto UpdateTransactionRequest) (*Transaction, error)
	Delete(id string) error
	DeleteMany(ids []string) error
	FindByID(id string) (*Transaction, error)

	Dashboard(query DashboardQuery) (*DashboardResponse, error)

	CreateActual(dto CreateActualTransactionRequest) (*Transaction, error)
	FindAllActual(query ListTransactionsQuery) ([]Transaction, error)

	CreatePlanned(dto CreatePlannedTransactionRequest) (*Transaction, error)
	CreateBulkPlanned(dto CreateBulkPlannedTransactionsRequest) ([]Transaction, error)
	FindAllPlanned(query ListTransactionsQuery) ([]Transaction, error)

	ImportNubank(fileBytes []byte, dto ImportNubankConfigRequest) (string, error)
}

type service struct {
	repository Repository
	publisher  EventPublisher
}

// NewService wires a transaction service with its repository. publisher
// broadcasts realtime events (currently just import job progress) and is
// satisfied by *realtime.Hub.
func NewService(repository Repository, publisher EventPublisher) Service {
	return &service{repository: repository, publisher: publisher}
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
	if dto.PaidAt != "" {
		model.PaidAt = parseTransactionDate(dto.PaidAt)
	}
	return s.repository.Update(model, dto.CategoryIDs)
}

func (s *service) Delete(id string) error {
	if id == "" {
		return errors.New("transaction id is required")
	}
	return s.repository.Delete(id)
}

func (s *service) DeleteMany(ids []string) error {
	if len(ids) == 0 {
		return errors.New("transaction ids are required")
	}
	return s.repository.DeleteMany(ids)
}

func (s *service) FindByID(id string) (*Transaction, error) {
	return s.repository.FindByID(id)
}

// ACTUAL

func (s *service) CreateActual(dto CreateActualTransactionRequest) (*Transaction, error) {
	model := CreateActualRequestToModel(dto)
	return s.repository.Create(&model, dto.CategoryIDs)
}

func (s *service) FindAllActual(query ListTransactionsQuery) ([]Transaction, error) {
	return s.repository.FindAllActual(toTransactionFilter(query))
}

// PLANNED
func (s *service) CreatePlanned(dto CreatePlannedTransactionRequest) (*Transaction, error) {
	model := CreatePlannedRequestToModel(dto)
	return s.repository.Create(&model, dto.CategoryIDs)
}

func (s *service) FindAllPlanned(query ListTransactionsQuery) ([]Transaction, error) {
	return s.repository.FindAllPlanned(toTransactionFilter(query))
}

func (s *service) CreateBulkPlanned(dto CreateBulkPlannedTransactionsRequest) ([]Transaction, error) {
	models, err := CreateBulkPlannedRequestToModels(dto)
	if err != nil {
		return nil, err
	}

	created := make([]Transaction, 0, len(models))
	for _, model := range models {
		result, err := s.repository.Create(&model, dto.CategoryIDs)
		if err != nil {
			return nil, err
		}
		created = append(created, *result)
	}

	return created, nil
}
