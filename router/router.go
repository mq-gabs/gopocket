package router

import (
	"gopocket/internal/category"
	"gopocket/internal/transaction"

	"github.com/gin-gonic/gin"
)

// New builds the application router with all registered endpoints.
func New(
	categoryEndpoint *category.Endpoint,
	transactionEndpoint *transaction.Endpoint,
) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	categoryEndpoint.RegisterRoutes(api)
	transactionEndpoint.RegisterRoutes(api)

	return r
}
