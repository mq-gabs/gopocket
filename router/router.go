package router

import (
	ui "gopocket/gopocket-ui"
	"gopocket/internal/category"
	"gopocket/internal/goal"
	"gopocket/internal/realtime"
	"gopocket/internal/transaction"
	"io/fs"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// New builds the application router with all registered endpoints.
func New(
	categoryEndpoint *category.Endpoint,
	transactionEndpoint *transaction.Endpoint,
	goalEndpoint *goal.Endpoint,
	realtimeEndpoint *realtime.Endpoint,
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
	goalEndpoint.RegisterRoutes(api)
	realtimeEndpoint.RegisterRoutes(api)

	uiFS, err := ui.FS()
	if err != nil {
		panic("cannot embed UI")
	}

	r.NoRoute(serveUI(uiFS))

	return r
}

// serveUI resolves a request path against the statically exported Next.js
// site. App Router export emits, for a route like "transactions", both
// "transactions.html" (the actual page) and a "transactions/" directory
// containing RSC prefetch fragments (no index.html inside it). A plain
// http.FileServer would match that directory first, redirect to a trailing
// slash, and list the fragment files instead of rendering the page. To keep
// the requested URL stable across a reload, resolve exact static files
// first, then fall back to "<path>.html" before giving up.
//
// Page/404 responses are written directly from the embedded bytes rather
// than through http.FileServer: it 301-redirects any path ending in
// "index.html" (canonicalizing "/index.html" to "/", which would loop on
// the root route) and always writes status 200 itself, clobbering a 404
// set beforehand.
func serveUI(uiFS fs.FS) gin.HandlerFunc {
	httpFS := http.FS(uiFS)

	return func(c *gin.Context) {
		p := strings.Trim(c.Request.URL.Path, "/")
		if p == "" {
			p = "index"
		}

		if info, err := fs.Stat(uiFS, p); err == nil && !info.IsDir() {
			c.FileFromFS(p, httpFS)
			return
		}

		if data, err := fs.ReadFile(uiFS, p+".html"); err == nil {
			c.Data(http.StatusOK, "text/html; charset=utf-8", data)
			return
		}

		if data, err := fs.ReadFile(uiFS, "404.html"); err == nil {
			c.Data(http.StatusNotFound, "text/html; charset=utf-8", data)
			return
		}

		c.Status(http.StatusNotFound)
	}
}
