package router

import (
	ui "gopocket/gopocket-ui"
	"gopocket/internal/category"
	"gopocket/internal/transaction"
	"net/http"
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
			"http://localhost:8080", // Bin
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

	fs, err := ui.FS()
	if err != nil {
		panic("cannot embed UI")
	}

	r.NoRoute(gin.WrapH(http.FileServer(http.FS(fs))))

	return r
}
