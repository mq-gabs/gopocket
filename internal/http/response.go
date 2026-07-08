package http

import "github.com/gin-gonic/gin"

// Response defines the standard API envelope used by every endpoint.
type Response[T any] struct {
	Status bool   `json:"status"`
	Data   *T     `json:"data,omitempty"`
	Error  string `json:"error,omitempty"`
}

// WriteSuccess writes a successful response payload.
func WriteSuccess[T any](ctx *gin.Context, statusCode int, data T) {
	payload := data
	ctx.JSON(statusCode, Response[T]{Status: true, Data: &payload})
}

// WriteError writes a failed response payload.
func WriteError(ctx *gin.Context, statusCode int, message string) {
	ctx.JSON(statusCode, Response[any]{Status: false, Error: message})
}
