package transaction

import (
	"fmt"
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

// CreateBulkPlannedRequestToModels expands a bulk request into one planned
// transaction per installment. The total amount is split equally, with the
// last installment absorbing any remainder. Installment i is due i months
// after FirstDueAt on the same day (clamped to the last day of shorter months,
// e.g. Jan 31 -> Feb 28) and titled with an "(index/total)" suffix, e.g.
// "Installment (2/5)".
func CreateBulkPlannedRequestToModels(dto CreateBulkPlannedTransactionsRequest) ([]Transaction, error) {
	first, err := time.Parse("2006-01-02", dto.FirstDueAt)
	if err != nil {
		return nil, fmt.Errorf("first_due_at must be a valid date in YYYY-MM-DD format")
	}
	if dto.Installments < 1 {
		return nil, fmt.Errorf("installments must be at least 1")
	}

	base := dto.Amount / dto.Installments
	remainder := dto.Amount - base*dto.Installments

	models := make([]Transaction, 0, dto.Installments)
	for index := 1; index <= dto.Installments; index++ {
		amount := base
		if index == dto.Installments {
			amount += remainder
		}

		// Always offset from the first month (not the previous installment) so
		// a clamped day (Feb 28) doesn't drag later months down with it.
		monthStart := time.Date(first.Year(), first.Month()+time.Month(index-1), 1, 0, 0, 0, 0, time.UTC)

		models = append(models, Transaction{
			Title:       fmt.Sprintf("%s (%d/%d)", dto.Title, index, dto.Installments),
			Description: dto.Description,
			Amount:      amount,
			Type:        transactiontype.TransactionType(dto.Type),
			PaidAt:      nil,
			DueAt:       dueDateInMonth(monthStart.Year(), monthStart.Month(), first.Day()),
		})
	}

	return models, nil
}

// dueDateInMonth builds a noon-UTC timestamp for the given day within
// year/month, clamping to the month's last day (e.g. day 31 in April becomes
// April 30) instead of overflowing into the next month.
func dueDateInMonth(year int, month time.Month, day int) time.Time {
	lastDay := time.Date(year, month+1, 1, 0, 0, 0, 0, time.UTC).AddDate(0, 0, -1).Day()
	if day > lastDay {
		day = lastDay
	}
	return time.Date(year, month, day, 12, 0, 0, 0, time.UTC)
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
