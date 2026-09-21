package goal

import (
	"fmt"
	"strings"
	"time"
)

const dateLayout = "2006-01-02"

// ToResponse maps the database model to the public DTO, computing progress
// as of now. The goal's Transactions must be loaded.
func ToResponse(model *Goal, now time.Time) GoalResponse {
	progress := CalculateProgress(model, now)

	var dueAt *string
	if model.DueAt != nil {
		formatted := model.DueAt.UTC().Format(dateLayout)
		dueAt = &formatted
	}

	return GoalResponse{
		ID:               model.ID,
		Name:             model.Name,
		Description:      model.Description,
		TotalAmount:      model.TotalAmount,
		DueAt:            dueAt,
		PaidAmount:       progress.Paid,
		CommittedAmount:  progress.Committed,
		RemainingAmount:  progress.Remaining,
		PaidPercent:      progress.PaidPercent,
		CommittedPercent: progress.CommittedPercent,
		DaysLeft:         progress.DaysLeft,
		MonthlyNeeded:    progress.MonthlyNeeded,
		TransactionCount: len(model.Transactions),
	}
}

// CreateRequestToModel maps a create request DTO to the database model.
func CreateRequestToModel(dto CreateGoalRequest) (Goal, error) {
	dueAt, err := parseDueAt(dto.DueAt)
	if err != nil {
		return Goal{}, err
	}

	return Goal{
		Name:        dto.Name,
		Description: dto.Description,
		TotalAmount: dto.TotalAmount,
		DueAt:       dueAt,
	}, nil
}

// parseDueAt parses an optional "YYYY-MM-DD" date into a noon-UTC timestamp
// (the same convention as planned transactions' due dates). Nil, empty or
// blank means the goal has no deadline.
func parseDueAt(value *string) (*time.Time, error) {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil, nil
	}

	parsed, err := time.Parse(dateLayout, strings.TrimSpace(*value))
	if err != nil {
		return nil, fmt.Errorf("due_at must be a valid date in YYYY-MM-DD format")
	}

	dueAt := time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 12, 0, 0, 0, time.UTC)
	return &dueAt, nil
}
