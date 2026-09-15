package transaction

// CreateActualTransactionRequest is the request payload for creating an actual transaction.
type CreateActualTransactionRequest struct {
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Amount      int    `json:"amount"`
	Type        string `json:"type"`
	CategoryID  string `json:"category_id"`
	PaidAt      string `json:"paid_at"`
}

// CreatePlannedTransactionRequest is the request payload for creating a planned transaction.
type CreatePlannedTransactionRequest struct {
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Amount      int    `json:"amount"`
	Type        string `json:"type"`
	CategoryID  string `json:"category_id"`
	PaidAt      string `json:"paid_at"`
	DueAt       string `json:"due_at"`
}

// UpdateTransactionRequest is the request payload for updating a transaction.
type UpdateTransactionRequest struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Amount      int    `json:"amount,omitempty"`
	Type        string `json:"type,omitempty"`
	CategoryID  string `json:"category_id,omitempty"`
	PaidAt      string `json:"paid_at,omitempty"`
}

// TransactionResponse is the public response payload for a transaction.
type TransactionResponse struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description,omitempty"`
	Amount      int     `json:"amount"`
	Type        string  `json:"type"`
	CategoryID  string  `json:"category_id"`
	PaidAt      *string `json:"paid_at"`
}
