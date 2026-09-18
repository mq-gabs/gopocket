package http

import "github.com/gin-gonic/gin"

// Response defines the standard API envelope used by every endpoint.
type Response[T any] struct {
	Status bool   `json:"status"`
	Data   *T     `json:"data,omitempty"`
	Error  string `json:"error,omitempty"`
	// Key identifies the error for the frontend to translate, since Error
	// itself is an untranslated, developer-facing message (Go error text or
	// a hardcoded English string). The frontend falls back to its own
	// generic translated message when it doesn't recognize the key.
	Key string `json:"key,omitempty"`
}

// Generic error keys reusable across every domain package.
const (
	KeyInvalidRequestBody = "invalid_request_body"
	KeyValidationFailed   = "validation_failed"
	KeyInternalError      = "internal_error"
)

// WriteSuccess writes a successful response payload.
func WriteSuccess[T any](ctx *gin.Context, statusCode int, data T) {
	payload := data
	ctx.JSON(statusCode, Response[T]{Status: true, Data: &payload})
}

// WriteError writes a failed response payload. message is a developer-facing
// description (logged/shown as a last-resort fallback); key is the stable
// identifier the frontend uses to pick a translated message.
func WriteError(ctx *gin.Context, statusCode int, message string, key string) {
	ctx.JSON(statusCode, Response[any]{Status: false, Error: message, Key: key})
}
