package goal

import (
	"errors"
	"net/http"
	"strings"
	"time"

	ginhttp "gopocket/internal/http"
	"gopocket/internal/transaction"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	keyGoalNotFound         = "goal_not_found"
	keyGoalsNotFound        = "goals_not_found"
	keyTransactionsNotFound = "transactions_not_found"
	keyTransactionNotFound  = "transaction_not_found"
)

// Endpoint handles HTTP traffic for goals.
type Endpoint struct {
	service Service
}

// NewEndpoint creates a goal endpoint with constructor injection.
func NewEndpoint(service Service) *Endpoint {
	return &Endpoint{service: service}
}

// RegisterRoutes attaches goal routes to the router.
func (e *Endpoint) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/goals", e.list)
	router.POST("/goals", e.create)
	router.GET("/goals/:id", e.get)
	router.PATCH("/goals/:id", e.update)
	router.DELETE("/goals/:id", e.delete)

	router.GET("/goals/:id/transactions", e.listTransactions)
	router.DELETE("/goals/:id/transactions/:transactionId", e.unlinkTransaction)
	router.POST("/goals/link-transactions", e.linkTransactions)

	router.GET("/transactions/:id/goals", e.listTransactionGoals)
	router.PUT("/transactions/:id/goals", e.setTransactionGoals)
}

func (e *Endpoint) create(ctx *gin.Context) {
	dto, err := ginhttp.ReadBody[CreateGoalRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body", ginhttp.KeyInvalidRequestBody)
		return
	}

	if err := ValidateCreateGoal(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error(), ginhttp.KeyValidationFailed)
		return
	}

	model, err := e.service.Create(*dto)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error(), ginhttp.KeyValidationFailed)
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusCreated, ToResponse(model, time.Now()))
}

func (e *Endpoint) get(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	model, err := e.service.FindByID(id)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "goal not found", keyGoalNotFound)
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, ToResponse(model, time.Now()))
}

func (e *Endpoint) list(ctx *gin.Context) {
	models, err := e.service.FindAll()
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error(), ginhttp.KeyInternalError)
		return
	}

	now := time.Now()
	responses := make([]GoalResponse, 0, len(models))
	for i := range models {
		responses = append(responses, ToResponse(&models[i], now))
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, responses)
}

func (e *Endpoint) update(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	dto, err := ginhttp.ReadBody[UpdateGoalRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body", ginhttp.KeyInvalidRequestBody)
		return
	}

	if err := ValidateUpdateGoal(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error(), ginhttp.KeyValidationFailed)
		return
	}

	model, err := e.service.Update(id, *dto)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ginhttp.WriteError(ctx, http.StatusNotFound, "goal not found", keyGoalNotFound)
			return
		}
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error(), ginhttp.KeyValidationFailed)
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, ToResponse(model, time.Now()))
}

func (e *Endpoint) delete(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	if err := e.service.Delete(id); err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "goal not found", keyGoalNotFound)
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, map[string]bool{"deleted": true})
}

func (e *Endpoint) listTransactions(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	models, err := e.service.FindTransactions(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ginhttp.WriteError(ctx, http.StatusNotFound, "goal not found", keyGoalNotFound)
			return
		}
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error(), ginhttp.KeyInternalError)
		return
	}

	responses := make([]transaction.TransactionResponse, 0, len(models))
	for i := range models {
		responses = append(responses, transaction.ToResponse(&models[i]))
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, responses)
}

func (e *Endpoint) linkTransactions(ctx *gin.Context) {
	dto, err := ginhttp.ReadBody[LinkTransactionsRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body", ginhttp.KeyInvalidRequestBody)
		return
	}

	if err := ValidateLinkTransactions(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error(), ginhttp.KeyValidationFailed)
		return
	}

	if err := e.service.LinkTransactions(*dto); err != nil {
		switch {
		case errors.Is(err, ErrGoalsNotFound):
			ginhttp.WriteError(ctx, http.StatusNotFound, err.Error(), keyGoalsNotFound)
		case errors.Is(err, ErrTransactionsNotFound):
			ginhttp.WriteError(ctx, http.StatusNotFound, err.Error(), keyTransactionsNotFound)
		default:
			ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error(), ginhttp.KeyInternalError)
		}
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, map[string]bool{"linked": true})
}

func (e *Endpoint) unlinkTransaction(ctx *gin.Context) {
	goalID := strings.TrimSpace(ctx.Param("id"))
	transactionID := strings.TrimSpace(ctx.Param("transactionId"))

	if err := e.service.UnlinkTransaction(goalID, transactionID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ginhttp.WriteError(ctx, http.StatusNotFound, "goal not found", keyGoalNotFound)
			return
		}
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error(), ginhttp.KeyInternalError)
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, map[string]bool{"unlinked": true})
}

// listTransactionGoals returns the ids of the goals a transaction is linked to.
func (e *Endpoint) listTransactionGoals(ctx *gin.Context) {
	transactionID := strings.TrimSpace(ctx.Param("id"))

	ids, err := e.service.FindGoalIDsByTransaction(transactionID)
	if err != nil {
		if errors.Is(err, ErrTransactionsNotFound) {
			ginhttp.WriteError(ctx, http.StatusNotFound, "transaction not found", keyTransactionNotFound)
			return
		}
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error(), ginhttp.KeyInternalError)
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, ids)
}

// setTransactionGoals replaces the set of goals a transaction is linked to.
func (e *Endpoint) setTransactionGoals(ctx *gin.Context) {
	transactionID := strings.TrimSpace(ctx.Param("id"))
	dto, err := ginhttp.ReadBody[SetTransactionGoalsRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body", ginhttp.KeyInvalidRequestBody)
		return
	}

	if err := ValidateSetTransactionGoals(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error(), ginhttp.KeyValidationFailed)
		return
	}

	if err := e.service.SetTransactionGoals(transactionID, *dto); err != nil {
		switch {
		case errors.Is(err, ErrTransactionsNotFound):
			ginhttp.WriteError(ctx, http.StatusNotFound, "transaction not found", keyTransactionNotFound)
		case errors.Is(err, ErrGoalsNotFound):
			ginhttp.WriteError(ctx, http.StatusNotFound, err.Error(), keyGoalsNotFound)
		default:
			ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error(), ginhttp.KeyInternalError)
		}
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, map[string]bool{"updated": true})
}
