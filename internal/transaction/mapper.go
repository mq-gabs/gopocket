package transaction

import (
	"gopocket/internal/transaction/transactiontype"
	"strings"
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
		PaidAt:      parseOptionalTransactionDate(dto.PaidAt),
		DueAt:       *parseTransactionDate(dto.DueAt),
	}
}

// toTransactionFilter parses raw query parameters into a repository-ready
// filter. EndDate accepts the literal "now" to mean the current instant.
// Unparseable or empty dates leave the corresponding bound unset.
func toTransactionFilter(query ListTransactionsQuery) TransactionFilter {
	filter := TransactionFilter{
		Search:      strings.TrimSpace(query.Search),
		CategoryIDs: query.CategoryIDs,
		Type:        query.Type,
	}

	if parsed, err := time.Parse(time.RFC3339, query.StartDate); err == nil {
		filter.StartDate = &parsed
	}

	if strings.EqualFold(strings.TrimSpace(query.EndDate), "now") {
		now := time.Now()
		filter.EndDate = &now
	} else if parsed, err := time.Parse(time.RFC3339, query.EndDate); err == nil {
		filter.EndDate = &parsed
	}

	return filter
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

// parseOptionalTransactionDate parses an RFC3339 timestamp, leaving it unset
// (nil) when the value is empty or malformed. Used for planned transactions,
// whose paid_at is only populated once they are marked as paid.
func parseOptionalTransactionDate(value string) *time.Time {
	if value == "" {
		return nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil
	}
	return &parsed
}
