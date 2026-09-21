package goal

import (
	"errors"
	"testing"

	"gopocket/internal/category"
	"gopocket/internal/transaction"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func newTestRepository(t *testing.T) (Repository, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file:"+uuid.NewString()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&category.Category{}, &transaction.Transaction{}, &Goal{}); err != nil {
		t.Fatal(err)
	}

	return NewRepository(db), db
}

func TestRepository_LinkTransactionsIsIdempotentAndComputesProgress(t *testing.T) {
	repo, db := newTestRepository(t)

	goal, err := repo.Create(&Goal{Name: "Trip", TotalAmount: 1000})
	if err != nil {
		t.Fatal(err)
	}

	txPaid := transaction.Transaction{Title: "paid", Amount: 300, Type: "expense", PaidAt: &goal.CreatedAt}
	txPlanned := transaction.Transaction{Title: "planned", Amount: 200, Type: "expense"}
	if err := db.Create(&txPaid).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&txPlanned).Error; err != nil {
		t.Fatal(err)
	}

	ids := []string{txPaid.ID, txPlanned.ID}
	// Linking twice must not duplicate the association.
	for range 2 {
		if err := repo.LinkTransactions([]string{goal.ID}, ids); err != nil {
			t.Fatal(err)
		}
	}

	loaded, err := repo.FindByID(goal.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(loaded.Transactions) != 2 {
		t.Fatalf("linked transactions = %d, want 2", len(loaded.Transactions))
	}

	p := CalculateProgress(loaded, goal.CreatedAt)
	if p.Paid != 300 || p.Committed != 200 || p.Remaining != 500 {
		t.Errorf("paid/committed/remaining = %d/%d/%d, want 300/200/500", p.Paid, p.Committed, p.Remaining)
	}

	linked, err := repo.FindTransactions(goal.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(linked) != 2 || linked[0].ID != txPaid.ID {
		t.Errorf("expected paid transaction listed first, got %+v", linked)
	}

	// A soft-deleted transaction stops counting toward the goal.
	if err := db.Delete(&txPlanned).Error; err != nil {
		t.Fatal(err)
	}
	loaded, _ = repo.FindByID(goal.ID)
	if p := CalculateProgress(loaded, goal.CreatedAt); p.Committed != 0 {
		t.Errorf("committed after deleting the planned transaction = %d, want 0", p.Committed)
	}

	if err := repo.UnlinkTransaction(goal.ID, txPaid.ID); err != nil {
		t.Fatal(err)
	}
	loaded, _ = repo.FindByID(goal.ID)
	if len(loaded.Transactions) != 0 {
		t.Errorf("linked transactions after unlink = %d, want 0", len(loaded.Transactions))
	}
}

func TestRepository_LinkTransactionsNotFound(t *testing.T) {
	repo, db := newTestRepository(t)

	tx := transaction.Transaction{Title: "t", Amount: 1, Type: "expense"}
	if err := db.Create(&tx).Error; err != nil {
		t.Fatal(err)
	}

	if err := repo.LinkTransactions([]string{uuid.NewString()}, []string{tx.ID}); !errors.Is(err, ErrGoalsNotFound) {
		t.Errorf("err = %v, want ErrGoalsNotFound", err)
	}

	goal, _ := repo.Create(&Goal{Name: "g", TotalAmount: 10})
	if err := repo.LinkTransactions([]string{goal.ID}, []string{uuid.NewString()}); !errors.Is(err, ErrTransactionsNotFound) {
		t.Errorf("err = %v, want ErrTransactionsNotFound", err)
	}
}

func TestRepository_FindAllOrdersByDueDateNilLast(t *testing.T) {
	repo, _ := newTestRepository(t)

	noDue, _ := repo.Create(&Goal{Name: "no due", TotalAmount: 10})
	late, _ := repo.Create(&Goal{Name: "late", TotalAmount: 10, DueAt: due(2027, 6, 1)})
	soon, _ := repo.Create(&Goal{Name: "soon", TotalAmount: 10, DueAt: due(2026, 12, 1)})

	goals, err := repo.FindAll()
	if err != nil {
		t.Fatal(err)
	}
	got := []string{goals[0].ID, goals[1].ID, goals[2].ID}
	want := []string{soon.ID, late.ID, noDue.ID}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("order = %v, want %v", got, want)
		}
	}
}
