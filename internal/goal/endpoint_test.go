package goal

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"gopocket/internal/transaction"

	"github.com/gin-gonic/gin"
)

type envelope struct {
	Status bool            `json:"status"`
	Data   json.RawMessage `json:"data"`
	Key    string          `json:"key"`
}

func call(t *testing.T, router *gin.Engine, method, path string, body any) (int, envelope) {
	t.Helper()

	var reader *bytes.Reader
	if body != nil {
		raw, _ := json.Marshal(body)
		reader = bytes.NewReader(raw)
	} else {
		reader = bytes.NewReader(nil)
	}

	req := httptest.NewRequest(method, path, reader)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	var result envelope
	_ = json.Unmarshal(recorder.Body.Bytes(), &result)
	return recorder.Code, result
}

func TestEndpoint_GoalLifecycle(t *testing.T) {
	paidAt := time.Now()
	gin.SetMode(gin.TestMode)
	repo, db := newTestRepository(t)
	router := gin.New()
	NewEndpoint(NewService(repo)).RegisterRoutes(router.Group("/api"))

	// Validation failures.
	if code, res := call(t, router, "POST", "/api/goals", map[string]any{"name": "", "total_amount": 100}); code != 400 || res.Key != "validation_failed" {
		t.Errorf("empty name: got %d %q, want 400 validation_failed", code, res.Key)
	}
	if code, _ := call(t, router, "POST", "/api/goals", map[string]any{"name": "x", "total_amount": 0}); code != 400 {
		t.Errorf("zero total: got %d, want 400", code)
	}
	if code, _ := call(t, router, "POST", "/api/goals", map[string]any{"name": "x", "total_amount": 5, "due_at": "2026-02-31"}); code != 400 {
		t.Errorf("invalid date: got %d, want 400", code)
	}

	// Create with a due date.
	code, res := call(t, router, "POST", "/api/goals", map[string]any{"name": "Laptop", "total_amount": 100000, "due_at": "2027-01-15"})
	if code != http.StatusCreated {
		t.Fatalf("create: got %d", code)
	}
	var created GoalResponse
	_ = json.Unmarshal(res.Data, &created)
	if created.DueAt == nil || *created.DueAt != "2027-01-15" || created.RemainingAmount != 100000 || created.DaysLeft == nil {
		t.Fatalf("unexpected created goal: %+v", created)
	}

	// Link a paid and a planned transaction via the bulk route.
	paid := transaction.Transaction{Title: "paid", Amount: 30000, Type: "expense", PaidAt: &paidAt}
	planned := transaction.Transaction{Title: "planned", Amount: 20000, Type: "expense"}
	db.Create(&paid)
	db.Create(&planned)

	code, _ = call(t, router, "POST", "/api/goals/link-transactions", map[string]any{
		"goal_ids": []string{created.ID}, "transaction_ids": []string{paid.ID, planned.ID},
	})
	if code != 200 {
		t.Fatalf("link: got %d", code)
	}

	_, res = call(t, router, "GET", "/api/goals/"+created.ID, nil)
	var detail GoalResponse
	_ = json.Unmarshal(res.Data, &detail)
	if detail.PaidAmount != 30000 || detail.CommittedAmount != 20000 || detail.RemainingAmount != 50000 || detail.TransactionCount != 2 {
		t.Errorf("unexpected progress: %+v", detail)
	}
	if detail.MonthlyNeeded == nil {
		t.Error("monthly needed should be set for a goal with a due date")
	}

	_, res = call(t, router, "GET", "/api/goals/"+created.ID+"/transactions", nil)
	var txs []transaction.TransactionResponse
	_ = json.Unmarshal(res.Data, &txs)
	if len(txs) != 2 || txs[0].PaidAt == nil || txs[1].PaidAt != nil {
		t.Errorf("expected [paid, planned], got %+v", txs)
	}

	// Removing the due date on update.
	code, res = call(t, router, "PATCH", "/api/goals/"+created.ID, map[string]any{"name": "Laptop", "total_amount": 100000, "due_at": nil})
	var updated GoalResponse
	_ = json.Unmarshal(res.Data, &updated)
	if code != 200 || updated.DueAt != nil || updated.DaysLeft != nil || updated.MonthlyNeeded != nil || updated.PaidAmount != 30000 {
		t.Errorf("update clearing due date: %d %+v", code, updated)
	}

	// Unlink, then delete.
	if code, _ := call(t, router, "DELETE", "/api/goals/"+created.ID+"/transactions/"+paid.ID, nil); code != 200 {
		t.Errorf("unlink: got %d", code)
	}
	_, res = call(t, router, "GET", "/api/goals", nil)
	var list []GoalResponse
	_ = json.Unmarshal(res.Data, &list)
	if len(list) != 1 || list[0].TransactionCount != 1 {
		t.Errorf("list after unlink: %+v", list)
	}

	if code, _ := call(t, router, "DELETE", "/api/goals/"+created.ID, nil); code != 200 {
		t.Errorf("delete: got %d", code)
	}
	if code, res := call(t, router, "GET", "/api/goals/"+created.ID, nil); code != 404 || res.Key != "goal_not_found" {
		t.Errorf("get deleted: got %d %q", code, res.Key)
	}
}
