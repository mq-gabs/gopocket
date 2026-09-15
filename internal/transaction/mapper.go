package transaction

import (
	"gopocket/internal/transaction/transactiontype"
	"time"
)

// ToResponse maps the database model to the public DTO.
func ToResponse(model *Transaction) TransactionResponse {
	paidAt := model.PaidAt.Format(time.RFC3339)
	return TransactionResponse{
		ID:              model.ID,
		Title:           model.Title,
		Description:     model.Description,
		Amount:          model.Amount,
		Type:            string(model.Type),
		CategoryID:      model.CategoryID,
		PaidAt:&paidAt, 
	}
}

// CreateRequestToModel maps a create request DTO to the database model.
func CreateRequestToModel(dto CreateTransactionRequest) Transaction {
	return Transaction{
		Title:           dto.Title,
		Description:     dto.Description,
		Amount:          dto.Amount,
		Type:            transactiontype.TransactionType(dto.Type),
		CategoryID:      dto.CategoryID,
		PaidAt: parseTransactionDate(dto.PaidAt),
	}
}

func parseTransactionDate(value *string) *time.Time {
	if value == nil || *value == "" {
		now := time.Now()
		return &now 
	}
	parsed, err := time.Parse(time.RFC3339, *value)
	if err != nil {
		now := time.Now()
		return &now 
	}
	return &parsed
}

// UpdateRequestToModel maps an update request DTO to the database model.
func UpdateRequestToModel(dto UpdateTransactionRequest) Transaction {
	return Transaction{
		Title:       dto.Title,
		Description: dto.Description,
		Amount:      dto.Amount,
		Type:        transactiontype.TransactionType(dto.Type),
		CategoryID:  dto.CategoryID,
	}
}
