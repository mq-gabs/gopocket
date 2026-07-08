package transaction

import (
	"net/http"
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
	router.GET("/transactions", e.list)
	router.GET("/transactions/:id", e.get)
	router.POST("/transactions", e.create)
	router.PATCH("/transactions/:id", e.update)
	router.DELETE("/transactions/:id", e.delete)
}

func (e *Endpoint) create(ctx *gin.Context) {
	dto, err := ginhttp.ReadBody[CreateTransactionRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := ValidateCreateTransaction(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error())
		return
	}

	model, err := e.service.Create(*dto)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusCreated, ToResponse(model))
}

func (e *Endpoint) get(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	model, err := e.service.FindByID(id)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "transaction not found")
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, ToResponse(model))
}

func (e *Endpoint) list(ctx *gin.Context) {
	models, err := e.service.FindAll()
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
