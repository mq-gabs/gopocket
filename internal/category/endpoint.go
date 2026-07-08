package category

import (
	"net/http"
	"strings"

	ginhttp "gopocket/internal/http"

	"github.com/gin-gonic/gin"
)

// Endpoint handles HTTP traffic for categories.
type Endpoint struct {
	service Service
}

// NewEndpoint creates a category endpoint with constructor injection.
func NewEndpoint(service Service) *Endpoint {
	return &Endpoint{service: service}
}

// RegisterRoutes attaches category routes to the router.
func (e *Endpoint) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/categories", e.list)
	router.GET("/categories/:id", e.get)
	router.POST("/categories", e.create)
	router.PATCH("/categories/:id", e.update)
	router.DELETE("/categories/:id", e.delete)
}

func (e *Endpoint) create(ctx *gin.Context) {
	dto, err := ginhttp.ReadBody[CreateCategoryRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := ValidateCreateCategory(*dto); err != nil {
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
		ginhttp.WriteError(ctx, http.StatusNotFound, "category not found")
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

	responses := make([]CategoryResponse, 0, len(models))
	for _, model := range models {
		responses = append(responses, ToResponse(&model))
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, responses)
}

func (e *Endpoint) update(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	dto, err := ginhttp.ReadBody[UpdateCategoryRequest](ctx)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := ValidateUpdateCategory(*dto); err != nil {
		ginhttp.WriteError(ctx, http.StatusBadRequest, err.Error())
		return
	}

	model, err := e.service.Update(id, *dto)
	if err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "category not found")
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, ToResponse(model))
}

func (e *Endpoint) delete(ctx *gin.Context) {
	id := strings.TrimSpace(ctx.Param("id"))
	if err := e.service.Delete(id); err != nil {
		ginhttp.WriteError(ctx, http.StatusNotFound, "category not found")
		return
	}

	ginhttp.WriteSuccess(ctx, http.StatusOK, map[string]bool{"deleted": true})
}
