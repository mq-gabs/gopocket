package router

import (
	"gopocket/internal/category"
	"gopocket/internal/transaction"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// New builds the application router with all registered endpoints.
func New(
	categoryEndpoint *category.Endpoint,
	transactionEndpoint *transaction.Endpoint,
) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000", // Next.js
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	categoryEndpoint.RegisterRoutes(api)
	transactionEndpoint.RegisterRoutes(api)

	return r
}
