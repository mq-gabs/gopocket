// Package realtime provides a minimal WebSocket broadcast hub used to push
// general backend events (e.g. import job progress) to every connected UI
// client in real time.
package realtime

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// allowedOrigins mirrors the CORS configuration in router/router.go: this is
// a local, single-user app served from either the Next.js dev server or the
// embedded production binary.
var allowedOrigins = map[string]bool{
	"http://localhost:3000": true,
	"http://localhost:8080": true,
}

// Event is the envelope broadcast to every connected client.
type Event struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

// Hub tracks connected WebSocket clients and broadcasts events to all of
// them. Its zero value is not usable; construct with NewHub.
type Hub struct {
	mu       sync.Mutex
	clients  map[*websocket.Conn]struct{}
	upgrader websocket.Upgrader
}

// NewHub creates an empty hub ready to accept connections and publish
// events.
func NewHub() *Hub {
	return &Hub{
		clients: make(map[*websocket.Conn]struct{}),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				origin := r.Header.Get("Origin")
				return origin == "" || allowedOrigins[origin]
			},
		},
	}
}

// HandleConnection upgrades the request to a WebSocket connection and keeps
// it registered until the client disconnects. The connection is read-only
// from the client's side; the hub never expects incoming messages, it just
// reads (and discards) them to detect when the socket closes.
func (h *Hub) HandleConnection(ctx *gin.Context) {
	conn, err := h.upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		return
	}

	h.mu.Lock()
	h.clients[conn] = struct{}{}
	h.mu.Unlock()

	defer func() {
		h.mu.Lock()
		delete(h.clients, conn)
		h.mu.Unlock()
		conn.Close()
	}()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

// Publish broadcasts an event to every connected client. Clients that fail
// to receive it are dropped.
func (h *Hub) Publish(eventType string, data any) {
	payload, err := json.Marshal(Event{Type: eventType, Data: data})
	if err != nil {
		log.Printf("realtime: failed to marshal event %q: %v", eventType, err)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()
	for conn := range h.clients {
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
			conn.Close()
			delete(h.clients, conn)
		}
	}
}
