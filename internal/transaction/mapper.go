package transaction

import (
	"gopocket/internal/transaction/transactiontype"
	"time"
)

// ToResponse maps the database model to the public DTO.
func ToResponse(model *Transaction) TransactionResponse {
	var paidAt *string
	if model.PaidAt != nil {
		f := model.PaidAt.Format(time.RFC3339)
		paidAt = &f
	}

	categoryIDs := make([]string, 0, len(model.Categories))
	for _, c := range model.Categories {
		categoryIDs = append(categoryIDs, c.ID)
	}

	return TransactionResponse{
		ID:          model.ID,
		Title:       model.Title,
		Description: model.Description,
		Amount:      model.Amount,
		Type:        string(model.Type),
		CategoryIDs: categoryIDs,
		PaidAt:      paidAt,
		DueAt:       model.DueAt.Format(time.RFC3339),
	}
}

// CreateActualRequestToModel maps a create request DTO to the database model.
// Categories are associated separately by the repository.
func CreateActualRequestToModel(dto CreateActualTransactionRequest) Transaction {
	paidAt := parseTransactionDate(dto.PaidAt)
	return Transaction{
		Title:       dto.Title,
		Description: dto.Description,
		Amount:      dto.Amount,
		Type:        transactiontype.TransactionType(dto.Type),
		PaidAt:      paidAt,
		DueAt:       *paidAt,
	}
}

// CreatePlannedRequestToModel maps a create request DTO to the database model.
// Categories are associated separately by the repository.
func CreatePlannedRequestToModel(dto CreatePlannedTransactionRequest) Transaction {
	return Transaction{
		Title:       dto.Title,
		Description: dto.Description,
		Amount:      dto.Amount,
		Type:        transactiontype.TransactionType(dto.Type),
		PaidAt:      parseTransactionDate(dto.PaidAt),
		DueAt:       *parseTransactionDate(dto.DueAt),
	}
}

func parseTransactionDate(value string) *time.Time {
	if value == "" {
		now := time.Now()
		return &now
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		now := time.Now()
		return &now
	}
	return &parsed
}
