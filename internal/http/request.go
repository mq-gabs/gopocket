package http

import (
	"encoding/json"
	"errors"
	"io"

	"github.com/gin-gonic/gin"
)

// ReadBody decodes a JSON request body into the provided generic type.
func ReadBody[T any](ctx *gin.Context) (*T, error) {
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		return nil, err
	}

	if len(body) == 0 {
		return nil, errors.New("request body is empty")
	}

	var payload T
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, err
	}

	return &payload, nil
}
