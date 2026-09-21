package transaction

import "testing"

func TestCreateBulkPlannedRequestToModels_SplitsAmountAndClampsDays(t *testing.T) {
	models, err := CreateBulkPlannedRequestToModels(CreateBulkPlannedTransactionsRequest{
		Title:        "Loan",
		Amount:       100,
		Type:         "expense",
		Installments: 7,
		FirstDueAt:   "2026-01-31",
	})
	if err != nil {
		t.Fatal(err)
	}

	amounts := []int{14, 14, 14, 14, 14, 14, 16}
	dates := []string{"2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31", "2026-06-30", "2026-07-31"}
	if len(models) != len(amounts) {
		t.Fatalf("got %d models, want %d", len(models), len(amounts))
	}
	for i, m := range models {
		if m.Amount != amounts[i] {
			t.Errorf("installment %d amount = %d, want %d", i+1, m.Amount, amounts[i])
		}
		if got := m.DueAt.Format("2006-01-02"); got != dates[i] {
			t.Errorf("installment %d due = %s, want %s", i+1, got, dates[i])
		}
	}
}

func TestCreateBulkPlannedRequestToModels_LeapYearAndYearRollover(t *testing.T) {
	models, err := CreateBulkPlannedRequestToModels(CreateBulkPlannedTransactionsRequest{
		Title:        "Rent",
		Amount:       1000,
		Type:         "expense",
		Installments: 10,
		FirstDueAt:   "2027-11-30",
	})
	if err != nil {
		t.Fatal(err)
	}
	// Nov 30, Dec 30, Jan 30, Feb 29 (2028 is a leap year), Mar 30...
	if got := models[3].DueAt.Format("2006-01-02"); got != "2028-02-29" {
		t.Errorf("installment 4 due = %s, want 2028-02-29", got)
	}
	if got := models[4].DueAt.Format("2006-01-02"); got != "2028-03-30" {
		t.Errorf("installment 5 due = %s, want 2028-03-30", got)
	}
	if models[0].Amount != 100 || models[9].Amount != 100 {
		t.Errorf("amounts = %d..%d, want 100", models[0].Amount, models[9].Amount)
	}
}

func TestCreateBulkPlannedRequestToModels_InvalidDate(t *testing.T) {
	_, err := CreateBulkPlannedRequestToModels(CreateBulkPlannedTransactionsRequest{
		Installments: 2,
		FirstDueAt:   "2026-02-31",
	})
	if err == nil {
		t.Fatal("expected error for invalid date")
	}
}
