package goal

import (
	"math"
	"time"
)

// Progress is a goal's state derived from its linked transactions.
type Progress struct {
	Paid             int
	Committed        int
	Remaining        int
	PaidPercent      float64
	CommittedPercent float64
	DaysLeft         *int
	MonthlyNeeded    *int
}

// CalculateProgress derives a goal's progress at the given instant. The goal's
// Transactions must be loaded.
//
//   - paid: linked transactions with paid_at set.
//   - committed: linked planned transactions (paid_at unset).
//   - remaining: total - paid - committed, never below zero. It is the part
//     nobody has paid or planned yet.
//   - monthly needed: remaining spread over the months left until the due
//     date (see monthsUntil), rounded up to the cent.
func CalculateProgress(goal *Goal, now time.Time) Progress {
	var progress Progress

	for _, transaction := range goal.Transactions {
		if transaction.PaidAt != nil {
			progress.Paid += transaction.Amount
		} else {
			progress.Committed += transaction.Amount
		}
	}

	progress.Remaining = max(0, goal.TotalAmount-progress.Paid-progress.Committed)

	if goal.TotalAmount > 0 {
		progress.PaidPercent = math.Min(100, float64(progress.Paid)*100/float64(goal.TotalAmount))
		progress.CommittedPercent = math.Min(100-progress.PaidPercent, float64(progress.Committed)*100/float64(goal.TotalAmount))
	}

	if goal.DueAt != nil {
		today := dateOnly(now)
		// Due dates are stored at noon UTC, so read their calendar day in UTC.
		due := dateOnly(goal.DueAt.UTC())

		daysLeft := int(due.Sub(today).Hours() / 24)
		progress.DaysLeft = &daysLeft

		if daysLeft >= 0 {
			months := monthsUntil(today, due)
			monthly := (progress.Remaining + months - 1) / months
			progress.MonthlyNeeded = &monthly
		}
	}

	return progress
}

// dateOnly reduces an instant to its calendar date (in the instant's own
// location) as a UTC midnight, so two dates can be compared by whole days
// without time-of-day or DST skew.
func dateOnly(instant time.Time) time.Time {
	year, month, day := instant.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

// monthsUntil counts the months left from today to due, rounding a partial
// month up and never returning less than 1 (a goal due this month still has
// one month to be covered). Sep 20 -> Oct 5 is 1; Sep 20 -> Nov 25 is 3.
func monthsUntil(today, due time.Time) int {
	months := (due.Year()-today.Year())*12 + int(due.Month()-today.Month())
	if due.Day() > today.Day() {
		months++
	}
	return max(1, months)
}
