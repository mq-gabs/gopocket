package transaction

import (
	"fmt"
	"gopocket/internal/transaction/transactiontype"
	"math"
	"time"
)

const dashboardPageSize = 10

type DashboardQuery struct {
	Mode string
	Date string
	Page int
}

type DashboardResponse struct {
	Mode               string                  `json:"mode"`
	StartDate          string                  `json:"start_date"`
	EndDate            string                  `json:"end_date"`
	Summary            DashboardSummary        `json:"summary"`
	Trend              []DashboardTrendPoint   `json:"trend"`
	Expenses           []DashboardExpenseSlice `json:"expenses"`
	RecentTransactions []TransactionResponse   `json:"recent_transactions"`
	Page               int                     `json:"page"`
	PageSize           int                     `json:"page_size"`
	TotalTransactions  int                     `json:"total_transactions"`
	TotalPages         int                     `json:"total_pages"`
}

type DashboardSummary struct {
	TotalBalance  int `json:"total_balance"`
	TotalIncome   int `json:"total_income"`
	TotalExpenses int `json:"total_expenses"`
}

type DashboardTrendPoint struct {
	Label   string `json:"label"`
	Balance int    `json:"balance"`
}

type DashboardExpenseSlice struct {
	Category string `json:"category"`
	Amount   int    `json:"amount"`
}

func (s *service) Dashboard(query DashboardQuery) (*DashboardResponse, error) {
	start, end, err := dashboardPeriod(query)
	if err != nil {
		return nil, err
	}
	transactions, err := s.repository.FindForPeriod(start, end)
	if err != nil {
		return nil, err
	}
	page := query.Page
	if page < 1 {
		page = 1
	}
	response := buildDashboard(transactions, query.Mode, start, end, page)
	return &response, nil
}

func dashboardPeriod(query DashboardQuery) (time.Time, time.Time, error) {
	mode := query.Mode
	if mode == "" {
		mode = "month"
	}
	if mode != "month" && mode != "year" {
		return time.Time{}, time.Time{}, fmt.Errorf("mode must be month or year")
	}
	date := query.Date
	if date == "" {
		date = time.Now().Format("2006-01")
	}
	if mode == "year" {
		start, err := time.Parse("2006", date)
		if err != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("date must be YYYY")
		}
		return start, start.AddDate(1, 0, 0), nil
	}
	start, err := time.Parse("2006-01", date)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("date must be YYYY-MM")
	}
	return start, start.AddDate(0, 1, 0), nil
}

func buildDashboard(transactions []Transaction, mode string, start, end time.Time, page int) DashboardResponse {
	response := DashboardResponse{Mode: mode, StartDate: start.Format("2006-01-02"), EndDate: end.AddDate(0, 0, -1).Format("2006-01-02"), Page: page, PageSize: dashboardPageSize, TotalTransactions: len(transactions)}
	response.TotalPages = int(math.Ceil(float64(len(transactions)) / dashboardPageSize))
	if response.TotalPages == 0 {
		response.TotalPages = 1
	}
	if page > response.TotalPages {
		page = response.TotalPages
		response.Page = page
	}

	expenses := map[string]int{}
	balanceByPeriod := map[string]int{}
	for _, transaction := range transactions {
		period := transaction.TransactionDate
		if period.IsZero() {
			period = transaction.CreatedAt
		}
		label := period.Format("2006-01-02")
		if mode == "year" {
			label = period.Format("2006-01")
		}
		if transaction.Type == transactiontype.TransactionTypeIncome {
			response.Summary.TotalIncome += transaction.Amount
			balanceByPeriod[label] += transaction.Amount
		} else {
			response.Summary.TotalExpenses += transaction.Amount
			balanceByPeriod[label] -= transaction.Amount
			category := transaction.Category.Name
			if category == "" {
				category = "Uncategorized"
			}
			expenses[category] += transaction.Amount
		}
	}
	response.Summary.TotalBalance = response.Summary.TotalIncome - response.Summary.TotalExpenses
	response.Trend = dashboardTrend(balanceByPeriod, mode, start, end)
	for category, amount := range expenses {
		response.Expenses = append(response.Expenses, DashboardExpenseSlice{Category: category, Amount: amount})
	}
	startIndex := (page - 1) * dashboardPageSize
	if startIndex < len(transactions) {
		endIndex := startIndex + dashboardPageSize
		if endIndex > len(transactions) {
			endIndex = len(transactions)
		}
		for index := startIndex; index < endIndex; index++ {
			response.RecentTransactions = append(response.RecentTransactions, ToResponse(&transactions[index]))
		}
	}
	if response.Trend == nil {
		response.Trend = []DashboardTrendPoint{}
	}
	if response.Expenses == nil {
		response.Expenses = []DashboardExpenseSlice{}
	}
	if response.RecentTransactions == nil {
		response.RecentTransactions = []TransactionResponse{}
	}
	return response
}

func dashboardTrend(changes map[string]int, mode string, start, end time.Time) []DashboardTrendPoint {
	points := []DashboardTrendPoint{}
	balance := 0
	for cursor := start; cursor.Before(end); {
		label := cursor.Format("2006-01-02")
		next := cursor.AddDate(0, 0, 1)
		if mode == "year" {
			label = cursor.Format("2006-01")
			next = cursor.AddDate(0, 1, 0)
		}
		balance += changes[label]
		points = append(points, DashboardTrendPoint{Label: label, Balance: balance})
		cursor = next
	}
	return points
}
