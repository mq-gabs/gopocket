package transaction

// CreateActualTransactionRequest is the request payload for creating an actual transaction.
type CreateActualTransactionRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Amount      int      `json:"amount"`
	Type        string   `json:"type"`
	CategoryIDs []string `json:"category_ids"`
	PaidAt      string   `json:"paid_at"`
}

// CreatePlannedTransactionRequest is the request payload for creating a planned transaction.
type CreatePlannedTransactionRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Amount      int      `json:"amount"`
	Type        string   `json:"type"`
	CategoryIDs []string `json:"category_ids"`
	PaidAt      string   `json:"paid_at,omitempty"`
	DueAt       string   `json:"due_at"`
}

// UpdateTransactionRequest is the request payload for updating a transaction.
type UpdateTransactionRequest struct {
	Title       string   `json:"title,omitempty"`
	Description string   `json:"description,omitempty"`
	Amount      int      `json:"amount,omitempty"`
	Type        string   `json:"type,omitempty"`
	CategoryIDs []string `json:"category_ids"`
	PaidAt      string   `json:"paid_at,omitempty"`
}

// ListTransactionsQuery represents the raw filter parameters accepted by the
// transaction listing endpoints.
type ListTransactionsQuery struct {
	Search      string
	CategoryIDs []string
	Type        string
	StartDate   string
	EndDate     string
}

// TransactionResponse is the public response payload for a transaction.
type TransactionResponse struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Amount      int      `json:"amount"`
	Type        string   `json:"type"`
	CategoryIDs []string `json:"category_ids"`
	PaidAt      *string  `json:"paid_at"`
	DueAt       string   `json:"due_at"`
}
