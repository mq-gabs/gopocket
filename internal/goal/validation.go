package goal

import (
	"errors"

	"github.com/mq-gabs/vld/validator/vnumber"
	"github.com/mq-gabs/vld/validator/vslices"
	"github.com/mq-gabs/vld/validator/vstring"
)

var (
	validateName        = vstring.String("name", vstring.Required(), vstring.MaxLen(64))
	validateDescription = vstring.String("description", vstring.MaxLen(1024))
	validateTotalAmount = vnumber.Number("totalAmount", vnumber.IsPositive[int]())
	validateGoalIDs     = vslices.Slice("goalIds", vslices.Required[string](), vslices.Each(vstring.String("goalId", vstring.UUIDv4())))
	validateTxIDs       = vslices.Slice("transactionIds", vslices.Required[string](), vslices.Each(vstring.String("transactionId", vstring.UUIDv4())))
)

// ValidateCreateGoal validates a request to create a goal. due_at is checked
// for being a real calendar date separately, once it is parsed.
func ValidateCreateGoal(dto CreateGoalRequest) error {
	return errors.Join(
		validateName(dto.Name),
		validateDescription(dto.Description),
		validateTotalAmount(dto.TotalAmount),
	)
}

// ValidateUpdateGoal validates a request to update a goal.
func ValidateUpdateGoal(dto UpdateGoalRequest) error {
	return errors.Join(
		validateName(dto.Name),
		validateDescription(dto.Description),
		validateTotalAmount(dto.TotalAmount),
	)
}

// ValidateLinkTransactions validates a request to link transactions to goals.
func ValidateLinkTransactions(dto LinkTransactionsRequest) error {
	return errors.Join(
		validateGoalIDs(dto.GoalIDs),
		validateTxIDs(dto.TransactionIDs),
	)
}
