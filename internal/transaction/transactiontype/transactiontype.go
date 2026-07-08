package transactiontype

// TransactionType defines the supported transaction kinds.
type TransactionType string

const (
	TransactionTypeExpense TransactionType = "EXPENSE"
	TransactionTypeIncome  TransactionType = "INCOME"
)
