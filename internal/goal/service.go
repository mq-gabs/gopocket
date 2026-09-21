package goal

import (
	"errors"

	"gopocket/internal/transaction"
)

// Service encapsulates goal business logic.
type Service interface {
	Create(dto CreateGoalRequest) (*Goal, error)
	Update(id string, dto UpdateGoalRequest) (*Goal, error)
	Delete(id string) error
	FindByID(id string) (*Goal, error)
	FindAll() ([]Goal, error)

	FindTransactions(goalID string) ([]transaction.Transaction, error)
	LinkTransactions(dto LinkTransactionsRequest) error
	UnlinkTransaction(goalID string, transactionID string) error

	FindGoalIDsByTransaction(transactionID string) ([]string, error)
	SetTransactionGoals(transactionID string, dto SetTransactionGoalsRequest) error
}

type service struct {
	repository Repository
}

// NewService wires a goal service with its repository.
func NewService(repository Repository) Service {
	return &service{repository: repository}
}

func (s *service) Create(dto CreateGoalRequest) (*Goal, error) {
	model, err := CreateRequestToModel(dto)
	if err != nil {
		return nil, err
	}
	return s.repository.Create(&model)
}

func (s *service) Update(id string, dto UpdateGoalRequest) (*Goal, error) {
	dueAt, err := parseDueAt(dto.DueAt)
	if err != nil {
		return nil, err
	}

	model, err := s.repository.FindByID(id)
	if err != nil {
		return nil, err
	}

	model.Name = dto.Name
	model.Description = dto.Description
	model.TotalAmount = dto.TotalAmount
	model.DueAt = dueAt

	return s.repository.Update(model)
}

func (s *service) Delete(id string) error {
	if id == "" {
		return errors.New("goal id is required")
	}
	return s.repository.Delete(id)
}

func (s *service) FindByID(id string) (*Goal, error) {
	return s.repository.FindByID(id)
}

func (s *service) FindAll() ([]Goal, error) {
	return s.repository.FindAll()
}

func (s *service) FindTransactions(goalID string) ([]transaction.Transaction, error) {
	if _, err := s.repository.FindByID(goalID); err != nil {
		return nil, err
	}
	return s.repository.FindTransactions(goalID)
}

func (s *service) LinkTransactions(dto LinkTransactionsRequest) error {
	if len(dto.GoalIDs) == 0 {
		return errors.New("goal ids are required")
	}
	if len(dto.TransactionIDs) == 0 {
		return errors.New("transaction ids are required")
	}
	return s.repository.LinkTransactions(dto.GoalIDs, dto.TransactionIDs)
}

func (s *service) UnlinkTransaction(goalID string, transactionID string) error {
	return s.repository.UnlinkTransaction(goalID, transactionID)
}

func (s *service) FindGoalIDsByTransaction(transactionID string) ([]string, error) {
	return s.repository.FindGoalIDsByTransaction(transactionID)
}

func (s *service) SetTransactionGoals(transactionID string, dto SetTransactionGoalsRequest) error {
	return s.repository.SetTransactionGoals(transactionID, dto.GoalIDs)
}
