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

// CreateBulkPlannedTransactionsRequest is the request payload for creating a
// batch of planned transactions as installments. Amount is the total, split
// equally across Installments (the last one absorbs any remainder). The first
// installment is due on FirstDueAt ("YYYY-MM-DD") and each following one on the
// same day of the next months.
type CreateBulkPlannedTransactionsRequest struct {
	Title        string   `json:"title"`
	Description  string   `json:"description,omitempty"`
	Amount       int      `json:"amount"`
	Type         string   `json:"type"`
	CategoryIDs  []string `json:"category_ids"`
	Installments int      `json:"installments"`
	FirstDueAt   string   `json:"first_due_at"`
}

// DeleteBulkTransactionsRequest is the request payload for deleting a batch
// of transactions by id.
type DeleteBulkTransactionsRequest struct {
	IDs []string `json:"ids"`
}

// MarkPaidBulkTransactionsRequest is the request payload for marking a batch
// of transactions as paid by id.
type MarkPaidBulkTransactionsRequest struct {
	IDs []string `json:"ids"`
}

// SetCategoriesBulkTransactionsRequest is the request payload for adding a
// set of categories to a batch of transactions by id. Categories the
// transaction already has are left as-is.
type SetCategoriesBulkTransactionsRequest struct {
	IDs         []string `json:"ids"`
	CategoryIDs []string `json:"category_ids"`
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
