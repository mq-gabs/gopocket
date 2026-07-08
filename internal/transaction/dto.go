package transaction

// CreateTransactionRequest is the request payload for creating a transaction.
type CreateTransactionRequest struct {
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Amount      int    `json:"amount"`
	Type        string `json:"type"`
	CategoryID  string `json:"category_id"`
}

// UpdateTransactionRequest is the request payload for updating a transaction.
type UpdateTransactionRequest struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Amount      int    `json:"amount,omitempty"`
	Type        string `json:"type,omitempty"`
	CategoryID  string `json:"category_id,omitempty"`
}

// TransactionResponse is the public response payload for a transaction.
type TransactionResponse struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Amount      int    `json:"amount"`
	Type        string `json:"type"`
	CategoryID  string `json:"category_id"`
}
