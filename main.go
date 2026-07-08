package main

import (
	"fmt"
	"gopocket/database"
	categorypkg "gopocket/internal/category"
	transactionpkg "gopocket/internal/transaction"
	"gopocket/router"
	"log"
)

func main() {
	db, err := database.New("gopocket.db")
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	categoryRepository := categorypkg.NewRepository(db)
	categoryService := categorypkg.NewService(categoryRepository)
	categoryEndpoint := categorypkg.NewEndpoint(categoryService)

	transactionRepository := transactionpkg.NewRepository(db)
	transactionService := transactionpkg.NewService(transactionRepository)
	transactionEndpoint := transactionpkg.NewEndpoint(transactionService)

	r := router.New(categoryEndpoint, transactionEndpoint)

	fmt.Println("GoPocket server running on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
