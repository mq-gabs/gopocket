package transaction

import (
	"bytes"
	"encoding/csv"
	"errors"
	"fmt"
	"gopocket/internal/transaction/transactiontype"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ImportRuleRequest is a single conditional-categorization rule: whenever a
// transaction's title contains Term (case-insensitively), its categories
// gain CategoryIDs.
type ImportRuleRequest struct {
	Term        string   `json:"term"`
	CategoryIDs []string `json:"category_ids"`
}

// ImportNubankConfigRequest is the request payload accompanying a Nubank CSV
// import: categories applied to every imported transaction, plus a list of
// conditional rules.
type ImportNubankConfigRequest struct {
	GeneralCategoryIDs []string            `json:"general_category_ids"`
	Rules              []ImportRuleRequest `json:"rules"`
}

// ImportNubankResponse is returned as soon as the CSV is accepted; the
// import itself continues in the background and its progress/result is
// published over the realtime hub.
type ImportNubankResponse struct {
	JobID  string `json:"job_id"`
	Status string `json:"status"`
}

// ImportProgressEvent is published as each row of an import job is
// processed.
type ImportProgressEvent struct {
	JobID     string `json:"job_id"`
	Source    string `json:"source"`
	Processed int    `json:"processed"`
	Total     int    `json:"total"`
}

// ImportCompletedEvent is published once every row of an import job has been
// processed.
type ImportCompletedEvent struct {
	JobID   string `json:"job_id"`
	Source  string `json:"source"`
	Total   int    `json:"total"`
	Success int    `json:"success"`
	Failed  int    `json:"failed"`
}

// EventPublisher is the narrow interface the transaction service needs to
// broadcast import events. It is satisfied structurally by *realtime.Hub,
// avoiding an import cycle between the two packages.
type EventPublisher interface {
	Publish(eventType string, data any)
}

const importSourceNubank = "nubank"

// importProgressPublishInterval throttles how often progress events go out
// while a job runs: rather than one broadcast per row (which floods the
// socket on large files and renders faster than any UI could show), only the
// most recent processed count is published once per interval.
const importProgressPublishInterval = 250 * time.Millisecond

// Realtime event types published while processing an import job.
const (
	EventTypeImportProgress  = "transactions.import.progress"
	EventTypeImportCompleted = "transactions.import.completed"
)

var nubankCSVHeader = []string{"Data", "Valor", "Identificador", "Descrição"}

// ImportNubank validates the CSV's structure synchronously (so malformed
// files are rejected immediately with an error) and, if valid, starts
// processing the rows in the background, returning a job id the caller can
// use to correlate realtime progress/completion events.
func (s *service) ImportNubank(fileBytes []byte, dto ImportNubankConfigRequest) (string, error) {
	rows, err := parseNubankCSV(fileBytes)
	if err != nil {
		return "", err
	}

	jobID := uuid.NewString()
	rules := sanitizeImportRules(dto.Rules)

	go s.processNubankImport(jobID, rows, dto.GeneralCategoryIDs, rules)

	return jobID, nil
}

// parseNubankCSV strips a possible UTF-8 BOM, validates the header row
// matches nubankCSVHeader exactly, and returns the remaining data rows.
func parseNubankCSV(fileBytes []byte) ([][]string, error) {
	reader := csv.NewReader(bytes.NewReader(bytes.TrimPrefix(fileBytes, []byte{0xEF, 0xBB, 0xBF})))
	reader.FieldsPerRecord = -1

	header, err := reader.Read()
	if err != nil {
		return nil, errors.New("csv file is empty or invalid")
	}

	if !matchesNubankHeader(header) {
		return nil, fmt.Errorf(
			"csv must have exactly the columns: %s",
			strings.Join(nubankCSVHeader, ", "),
		)
	}

	rows, err := reader.ReadAll()
	if err != nil {
		return nil, errors.New("csv file is malformed")
	}

	return rows, nil
}

func matchesNubankHeader(header []string) bool {
	if len(header) != len(nubankCSVHeader) {
		return false
	}
	for i, column := range header {
		if strings.TrimSpace(column) != nubankCSVHeader[i] {
			return false
		}
	}
	return true
}

// sanitizeImportRules trims each rule's term and drops rules left with an
// empty term, per spec: an empty term must be ignored rather than matching
// everything.
func sanitizeImportRules(rules []ImportRuleRequest) []ImportRuleRequest {
	sanitized := make([]ImportRuleRequest, 0, len(rules))
	for _, rule := range rules {
		term := strings.TrimSpace(rule.Term)
		if term == "" {
			continue
		}
		sanitized = append(sanitized, ImportRuleRequest{Term: term, CategoryIDs: rule.CategoryIDs})
	}
	return sanitized
}

// processNubankImport runs in its own goroutine: it publishes an initial
// progress event, then at most one more per importProgressPublishInterval
// (always the most recently processed count, not one broadcast per row),
// plus a guaranteed final progress event and a completion event once done.
// Row failures are tallied, not fatal — the rest of the file still gets
// imported.
func (s *service) processNubankImport(jobID string, rows [][]string, generalCategoryIDs []string, rules []ImportRuleRequest) {
	total := len(rows)
	success, failed := 0, 0

	s.publisher.Publish(EventTypeImportProgress, ImportProgressEvent{
		JobID: jobID, Source: importSourceNubank, Processed: 0, Total: total,
	})

	lastPublishedAt := time.Now()

	for i, row := range rows {
		if err := s.importNubankRow(row, generalCategoryIDs, rules); err != nil {
			failed++
		} else {
			success++
		}

		processed := i + 1
		isLastRow := processed == total
		if isLastRow || time.Since(lastPublishedAt) >= importProgressPublishInterval {
			s.publisher.Publish(EventTypeImportProgress, ImportProgressEvent{
				JobID: jobID, Source: importSourceNubank, Processed: processed, Total: total,
			})
			lastPublishedAt = time.Now()
		}
	}

	s.publisher.Publish(EventTypeImportCompleted, ImportCompletedEvent{
		JobID: jobID, Source: importSourceNubank, Total: total, Success: success, Failed: failed,
	})
}

// importNubankRow parses a single CSV row and persists it as an actual
// transaction. Negative "Valor" values are expenses, positive ones are
// income; the stored amount is always the absolute value in cents.
func (s *service) importNubankRow(row []string, generalCategoryIDs []string, rules []ImportRuleRequest) error {
	if len(row) < 4 {
		return errors.New("row does not have the expected number of columns")
	}

	date, err := time.Parse("02/01/2006", strings.TrimSpace(row[0]))
	if err != nil {
		return fmt.Errorf("invalid date: %w", err)
	}

	value, err := strconv.ParseFloat(strings.TrimSpace(row[1]), 64)
	if err != nil || value == 0 {
		return errors.New("invalid amount")
	}

	title := strings.TrimSpace(row[3])
	if title == "" {
		return errors.New("description is required")
	}

	txType := transactiontype.TransactionTypeIncome
	if value < 0 {
		txType = transactiontype.TransactionTypeExpense
	}
	amount := int(math.Round(math.Abs(value) * 100))

	at := time.Date(date.Year(), date.Month(), date.Day(), 12, 0, 0, 0, time.UTC)
	model := Transaction{
		Title:  title,
		Amount: amount,
		Type:   txType,
		PaidAt: &at,
		DueAt:  at,
	}

	_, err = s.repository.Create(&model, matchImportCategories(title, generalCategoryIDs, rules))
	return err
}

// matchImportCategories returns the deduplicated union of the general
// categories and every rule's categories whose term is a case-insensitive
// substring of the title.
func matchImportCategories(title string, generalCategoryIDs []string, rules []ImportRuleRequest) []string {
	set := make(map[string]struct{}, len(generalCategoryIDs))
	for _, id := range generalCategoryIDs {
		set[id] = struct{}{}
	}

	lowerTitle := strings.ToLower(title)
	for _, rule := range rules {
		if strings.Contains(lowerTitle, strings.ToLower(rule.Term)) {
			for _, id := range rule.CategoryIDs {
				set[id] = struct{}{}
			}
		}
	}

	ids := make([]string, 0, len(set))
	for id := range set {
		ids = append(ids, id)
	}
	return ids
}
