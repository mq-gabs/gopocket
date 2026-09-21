package goal

import (
	"testing"
	"time"

	"gopocket/internal/transaction"
)

func paid(amount int) transaction.Transaction {
	at := time.Now()
	return transaction.Transaction{Amount: amount, PaidAt: &at}
}

func planned(amount int) transaction.Transaction {
	return transaction.Transaction{Amount: amount}
}

func due(year int, month time.Month, day int) *time.Time {
	d := time.Date(year, month, day, 12, 0, 0, 0, time.UTC)
	return &d
}

func TestCalculateProgress_PaidCommittedRemaining(t *testing.T) {
	goal := &Goal{
		TotalAmount:  1000,
		Transactions: []transaction.Transaction{paid(200), paid(100), planned(300)},
	}

	p := CalculateProgress(goal, time.Now())

	if p.Paid != 300 || p.Committed != 300 || p.Remaining != 400 {
		t.Errorf("paid/committed/remaining = %d/%d/%d, want 300/300/400", p.Paid, p.Committed, p.Remaining)
	}
	if p.PaidPercent != 30 || p.CommittedPercent != 30 {
		t.Errorf("percents = %v/%v, want 30/30", p.PaidPercent, p.CommittedPercent)
	}
	if p.DaysLeft != nil || p.MonthlyNeeded != nil {
		t.Error("days left and monthly needed must be nil without a due date")
	}
}

func TestCalculateProgress_OverCommittedIsCapped(t *testing.T) {
	goal := &Goal{
		TotalAmount:  100,
		Transactions: []transaction.Transaction{paid(80), planned(50)},
	}

	p := CalculateProgress(goal, time.Now())

	if p.Remaining != 0 {
		t.Errorf("remaining = %d, want 0", p.Remaining)
	}
	if p.PaidPercent != 80 || p.CommittedPercent != 20 {
		t.Errorf("percents = %v/%v, want 80/20 (sum capped at 100)", p.PaidPercent, p.CommittedPercent)
	}
}

func TestCalculateProgress_DaysLeftAndMonthlyNeeded(t *testing.T) {
	now := time.Date(2026, time.September, 20, 9, 30, 0, 0, time.UTC)

	cases := []struct {
		name        string
		dueAt       *time.Time
		remaining   int
		wantDays    int
		wantMonthly int
	}{
		{"next month, earlier day", due(2026, time.October, 5), 1000, 15, 1000},
		{"two months, later day rounds up", due(2026, time.November, 25), 1000, 66, 334},
		{"exactly on the day", due(2026, time.December, 20), 900, 91, 300},
		{"due today", due(2026, time.September, 20), 500, 0, 500},
		{"nothing remaining", due(2026, time.December, 20), 0, 91, 0},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			goal := &Goal{TotalAmount: c.remaining, DueAt: c.dueAt}
			p := CalculateProgress(goal, now)

			if p.DaysLeft == nil || *p.DaysLeft != c.wantDays {
				t.Errorf("days left = %v, want %d", p.DaysLeft, c.wantDays)
			}
			if p.MonthlyNeeded == nil || *p.MonthlyNeeded != c.wantMonthly {
				t.Errorf("monthly needed = %v, want %d", p.MonthlyNeeded, c.wantMonthly)
			}
		})
	}
}

func TestCalculateProgress_Overdue(t *testing.T) {
	now := time.Date(2026, time.September, 20, 9, 30, 0, 0, time.UTC)
	goal := &Goal{TotalAmount: 1000, DueAt: due(2026, time.September, 10)}

	p := CalculateProgress(goal, now)

	if p.DaysLeft == nil || *p.DaysLeft != -10 {
		t.Errorf("days left = %v, want -10", p.DaysLeft)
	}
	if p.MonthlyNeeded != nil {
		t.Errorf("monthly needed = %d, want nil once overdue", *p.MonthlyNeeded)
	}
}
