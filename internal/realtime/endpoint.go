package realtime

import "github.com/gin-gonic/gin"

// Endpoint handles the WebSocket route.
type Endpoint struct {
	hub *Hub
}

// NewEndpoint creates a realtime endpoint with constructor injection.
func NewEndpoint(hub *Hub) *Endpoint {
	return &Endpoint{hub: hub}
}

// RegisterRoutes attaches the WebSocket route to the router.
func (e *Endpoint) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/ws", e.hub.HandleConnection)
}
