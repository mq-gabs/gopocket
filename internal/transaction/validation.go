package transaction

import (
	"errors"
	"gopocket/internal/transaction/transactiontype"

	"github.com/mq-gabs/vld/validator/vnumber"
	"github.com/mq-gabs/vld/validator/vstring"
)

var (
	validateTitle       = vstring.String("title", vstring.MinLen(4), vstring.MaxLen(64))
	validateDescription = vstring.String("description", vstring.MaxLen(512))
	validateAmount      = vnumber.Number("amount", vnumber.IsNonZero[int]())
	validateType        = vstring.String("type", vstring.OneOf(string(transactiontype.TransactionTypeExpense), string(transactiontype.TransactionTypeIncome)))
	validateCategoryID  = vstring.String("categoryId", vstring.UUIDv4())
	validatePaidAt      = vstring.String("paidAt", vstring.Required())
	validateDueAt       = vstring.String("paidAt", vstring.Required())
)

// ValidateCreateActualTransaction is a placeholder validation hook for future rules.
func ValidateCreateActualTransaction(dto CreateActualTransactionRequest) error {
	return errors.Join(
		validateTitle(dto.Title),
		validateDescription(dto.Description),
		validateAmount(dto.Amount),
		validateType(dto.Type),
		validateCategoryID(dto.CategoryID),
		validatePaidAt(dto.PaidAt),
	)
}

// ValidateCreatePlannedTransaction is a placeholder validation hook for future rules.
func ValidateCreatePlannedTransaction(dto CreatePlannedTransactionRequest) error {
	return errors.Join(
		validateTitle(dto.Title),
		validateDescription(dto.Description),
		validateAmount(dto.Amount),
		validateType(dto.Type),
		validateCategoryID(dto.CategoryID),
		validatePaidAt(dto.PaidAt),
		validateDueAt(dto.DueAt),
	)
}

// ValidateUpdateTransaction is a placeholder validation hook for future rules.
func ValidateUpdateTransaction(dto UpdateTransactionRequest) error {
	return nil
}
