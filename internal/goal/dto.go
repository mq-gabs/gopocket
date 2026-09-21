package goal

// CreateGoalRequest is the request payload for creating a goal. DueAt is a
// "YYYY-MM-DD" date; omit it (or send null/empty) for a goal with no deadline.
type CreateGoalRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description,omitempty"`
	TotalAmount int     `json:"total_amount"`
	DueAt       *string `json:"due_at"`
}

// UpdateGoalRequest is the request payload for updating a goal. Unlike the
// other update payloads it replaces every field, because due_at must be able
// to go back to "no deadline" (null/empty), which a partial update can't tell
// apart from "not sent".
type UpdateGoalRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description,omitempty"`
	TotalAmount int     `json:"total_amount"`
	DueAt       *string `json:"due_at"`
}

// LinkTransactionsRequest is the request payload for linking a batch of
// transactions (paid or planned) to a batch of goals. Links a transaction
// already has are left as-is.
type LinkTransactionsRequest struct {
	GoalIDs        []string `json:"goal_ids"`
	TransactionIDs []string `json:"transaction_ids"`
}

// GoalResponse is the public response payload for a goal, including its
// progress computed from the linked transactions. All amounts are in cents.
type GoalResponse struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description,omitempty"`
	TotalAmount int     `json:"total_amount"`
	DueAt       *string `json:"due_at"`

	// PaidAmount is the sum of linked transactions already paid.
	PaidAmount int `json:"paid_amount"`
	// CommittedAmount is the sum of linked planned (unpaid) transactions.
	CommittedAmount int `json:"committed_amount"`
	// RemainingAmount is what is neither paid nor committed yet.
	RemainingAmount int `json:"remaining_amount"`
	// PaidPercent and CommittedPercent are 0-100 shares of TotalAmount,
	// capped so that together they never exceed 100.
	PaidPercent      float64 `json:"paid_percent"`
	CommittedPercent float64 `json:"committed_percent"`
	// DaysLeft is nil without a due date and negative once overdue.
	DaysLeft *int `json:"days_left"`
	// MonthlyNeeded is the amount to plan or pay per month to cover
	// RemainingAmount by the due date. Nil without a due date or once overdue.
	MonthlyNeeded *int `json:"monthly_needed"`
	// TransactionCount is the number of linked transactions.
	TransactionCount int `json:"transaction_count"`
}
