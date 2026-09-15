package transaction

import (
	"net/http"
	"strconv"
	"strings"

	ginhttp "gopocket/internal/http"

	"github.com/gin-gonic/gin"
)

// Endpoint handles HTTP traffic for transactions.
type Endpoint struct {
	service Service
}

// NewEndpoint creates a transaction endpoint with constructor injection.
func NewEndpoint(service Service) *Endpoint {
	return &Endpoint{service: service}
}

// RegisterRoutes attaches transaction routes to the router.
func (e *Endpoint) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/dashboard", e.dashboard)

	router.PATCH("/transactions/:id", e.update)
	router.DELETE("/transactions/:id", e.delete)
	router.GET("/transactions/:id", e.getByID)

	router.POST("/transactions/actual", e.createActual)
	router.GET("/transactions/actual", e.listActual)

	router.POST("/transactions/planned", e.createPlanned)
	router.GET("/transactions/planned", e.listPlanned)
}

func (e *Endpoint) dashboard(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	data, err := e.service.Dashboard(DashboardQuery{Mode: ctx.Query("mode"), Date: ctx.Query("date"), Page: page})
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error())
		return
	}
	ginhttp.WriteSuccess(ctx, http.StatusOK, data)
}

func (e *Endpoint) createActual(ctx *gin.Context) {
	dto, err := ginhttp.ReadBody[CreateActualTransactionRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := ValidateCreateActualTransaction(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error())
		return
	}

	model, err := e.service.CreateActual(*dto)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusCreated, ToResponse(model))
}

func (e *Endpoint) createPlanned(ctx *gin.Context) {
	dto, err := ginhttp.ReadBody[CreatePlannedTransactionRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := ValidateCreatePlannedTransaction(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error())
		return
	}

	model, err := e.service.CreatePlanned(*dto)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusCreated, ToResponse(model))
}

func (e *Endpoint) getByID(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	model, err := e.service.FindByID(id)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "transaction not found")
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, ToResponse(model))
}

func (e *Endpoint) listActual(ctx *gin.Context) {
	models, err := e.service.FindAllActual()
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	responses := make([]TransactionResponse, 0, len(models))
	for _, model := range models {
		responses = append(responses, ToResponse(&model))
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, responses)
}

func (e *Endpoint) listPlanned(ctx *gin.Context) {
	models, err := e.service.FindAllPlanned()
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	responses := make([]TransactionResponse, 0, len(models))
	for _, model := range models {
		responses = append(responses, ToResponse(&model))
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, responses)
}

func (e *Endpoint) update(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	dto, err := ginhttp.ReadBody[UpdateTransactionRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := ValidateUpdateTransaction(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error())
		return
	}

	model, err := e.service.Update(id, *dto)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "transaction not found")
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, ToResponse(model))
}

func (e *Endpoint) delete(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	if err := e.service.Delete(id); err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "transaction not found")
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, map[string]bool{"deleted": true})
}
