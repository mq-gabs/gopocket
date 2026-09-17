package transaction

import (
	"errors"
	"gopocket/internal/transaction/transactiontype"

	"github.com/mq-gabs/vld/validator/vnumber"
	"github.com/mq-gabs/vld/validator/vslices"
	"github.com/mq-gabs/vld/validator/vstring"
)

var (
	validateTitle          = vstring.String("title", vstring.MinLen(4), vstring.MaxLen(64))
	validateDescription    = vstring.String("description", vstring.MaxLen(512))
	validateAmount         = vnumber.Number("amount", vnumber.IsNonZero[int]())
	validateType           = vstring.String("type", vstring.OneOf(string(transactiontype.TransactionTypeExpense), string(transactiontype.TransactionTypeIncome)))
	validateCategoryIDItem = vstring.String("categoryId", vstring.UUIDv4())
	validateCategoryIDs    = vslices.Slice("categoryIds", vslices.Required[string](), vslices.Each(validateCategoryIDItem))
	validateIDItem         = vstring.String("id", vstring.UUIDv4())
	validateIDs            = vslices.Slice("ids", vslices.Required[string](), vslices.Each(validateIDItem))
	validatePaidAt         = vstring.String("paidAt", vstring.Required())
	validateDueAt          = vstring.String("dueAt", vstring.Required())
	validateDueDay         = vnumber.Number("dueDay", vnumber.InRange(1, 31))
	validateStartMonth     = vstring.String("startMonth", vstring.Required(), vstring.Pattern(`^\d{4}-(0[1-9]|1[0-2])$`))
	validateEndMonth       = vstring.String("endMonth", vstring.Required(), vstring.Pattern(`^\d{4}-(0[1-9]|1[0-2])$`))
)

// ValidateCreateActualTransaction is a placeholder validation hook for future rules.
func ValidateCreateActualTransaction(dto CreateActualTransactionRequest) error {
	return errors.Join(
		validateTitle(dto.Title),
		validateDescription(dto.Description),
		validateAmount(dto.Amount),
		validateType(dto.Type),
		validateCategoryIDs(dto.CategoryIDs),
		validatePaidAt(dto.PaidAt),
	)
}

// ValidateCreatePlannedTransaction is a placeholder validation hook for future rules.
// paid_at is intentionally not validated: planned transactions are unpaid
// until marked as paid, so it is left unset at creation time.
func ValidateCreatePlannedTransaction(dto CreatePlannedTransactionRequest) error {
	return errors.Join(
		validateTitle(dto.Title),
		validateDescription(dto.Description),
		validateAmount(dto.Amount),
		validateType(dto.Type),
		validateCategoryIDs(dto.CategoryIDs),
		validateDueAt(dto.DueAt),
	)
}

// ValidateCreateBulkPlannedTransactions validates a request to create a batch
// of planned transactions across a month range. The chronological ordering of
// StartMonth/EndMonth is checked separately, once they are parsed.
func ValidateCreateBulkPlannedTransactions(dto CreateBulkPlannedTransactionsRequest) error {
	return errors.Join(
		validateTitle(dto.Title),
		validateDescription(dto.Description),
		validateAmount(dto.Amount),
		validateType(dto.Type),
		validateCategoryIDs(dto.CategoryIDs),
		validateDueDay(dto.DueDay),
		validateStartMonth(dto.StartMonth),
		validateEndMonth(dto.EndMonth),
	)
}

// ValidateListTransactionsQuery validates optional filter parameters accepted
// by the transaction listing endpoints.
func ValidateListTransactionsQuery(query ListTransactionsQuery) error {
	errs := make([]error, 0, len(query.CategoryIDs)+1)

	if query.Type != "" {
		errs = append(errs, validateType(query.Type))
	}

	for _, categoryID := range query.CategoryIDs {
		errs = append(errs, validateCategoryIDItem(categoryID))
	}

	return errors.Join(errs...)
}

// ValidateDeleteBulkTransactions validates a request to delete a batch of
// transactions by id.
func ValidateDeleteBulkTransactions(dto DeleteBulkTransactionsRequest) error {
	return validateIDs(dto.IDs)
}

// ValidateUpdateTransaction is a placeholder validation hook for future rules.
func ValidateUpdateTransaction(dto UpdateTransactionRequest) error {
	if dto.CategoryIDs == nil {
		return nil
	}

	return vslices.Slice("categoryIds", vslices.Each(validateCategoryIDItem))(dto.CategoryIDs)
}

// ValidateImportNubankConfig validates the category ids referenced by a
// Nubank import request. Rules with an empty term are allowed here (they are
// dropped later, before matching) and their category ids are still checked
// for shape.
func ValidateImportNubankConfig(dto ImportNubankConfigRequest) error {
	errs := make([]error, 0, len(dto.GeneralCategoryIDs)+len(dto.Rules))

	for _, categoryID := range dto.GeneralCategoryIDs {
		errs = append(errs, validateCategoryIDItem(categoryID))
	}

	for _, rule := range dto.Rules {
		for _, categoryID := range rule.CategoryIDs {
			errs = append(errs, validateCategoryIDItem(categoryID))
		}
	}

	return errors.Join(errs...)
}
