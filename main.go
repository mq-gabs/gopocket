package main

import (
	"fmt"
	"gopocket/database"
	categorypkg "gopocket/internal/category"
	"gopocket/internal/realtime"
	transactionpkg "gopocket/internal/transaction"
	"gopocket/router"
	"log"
)

func main() {
	db, err := database.New("gopocket.db")
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	hub := realtime.NewHub()
	realtimeEndpoint := realtime.NewEndpoint(hub)

	categoryRepository := categorypkg.NewRepository(db)
	categoryService := categorypkg.NewService(categoryRepository)
	categoryEndpoint := categorypkg.NewEndpoint(categoryService)

	transactionRepository := transactionpkg.NewRepository(db)
	transactionService := transactionpkg.NewService(transactionRepository, hub)
	transactionEndpoint := transactionpkg.NewEndpoint(transactionService)

	r := router.New(categoryEndpoint, transactionEndpoint, realtimeEndpoint)

	fmt.Println("GoPocket server running on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
