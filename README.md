# GoPocket

A lightweight and modern personal finance API built with **Go**, **Gin**, **GORM**, and **SQLite**.

GoPocket is designed to make tracking personal income and expenses simple while maintaining a clean, scalable architecture that can evolve into a complete personal finance platform.

The project emphasizes maintainability, modularity, and clean separation of responsibilities, making it an excellent starting point for learning backend architecture in Go or for building a real-world finance application.

---

## Features

### Transactions

* Create transactions
* List transactions
* Retrieve transaction by ID
* Update transactions
* Delete transactions

### Categories

* Create categories
* List categories
* Retrieve category by ID
* Update categories
* Delete categories

### Architecture

* Clean modular architecture
* Dependency Injection
* Service / Repository separation
* Generic HTTP utilities
* Generic API responses
* Request validation layer
* DTOs separated from database models
* Mapper layer
* UUID primary keys
* Soft deletes
* Automatic database migrations

---

## Tech Stack

* Go
* Gin
* GORM
* SQLite
* UUID

---

## Project Structure

```text
.
├── internal
│   ├── category
│   ├── transaction
│   └── http
├── database
├── models
├── router
└── main.go
```

Each module contains:

* endpoint
* service
* repository
* model
* dto
* mapper
* validation

---

## Architecture

```text
HTTP Request
      │
      ▼
 Endpoint
      │
      ▼
 Validation
      │
      ▼
  Service
      │
      ▼
 Repository
      │
      ▼
 SQLite (GORM)
```

Response flow:

```text
Database
    │
    ▼
Repository
    │
    ▼
Service
    │
    ▼
Mapper
    │
    ▼
Response DTO
    │
    ▼
WriteSuccess / WriteError
```

---

## API Response Format

Every endpoint returns the same response structure.

### Success

```json
{
    "status": true,
    "data": {
        ...
    }
}
```

### Error

```json
{
    "status": false,
    "error": "resource not found"
}
```

---

## Transaction Model

```text
Transaction
├── ID
├── Title
├── Description
├── Amount
├── Type
├── CategoryID
├── CreatedAt
├── UpdatedAt
└── DeletedAt
```

---

## Category Model

```text
Category
├── ID
├── Name
├── Color
├── Icon
├── Type
├── CreatedAt
├── UpdatedAt
└── DeletedAt
```

---

## Running the Project

Clone the repository.

```bash
git clone https://github.com/<your-user>/gopocket.git
```

Enter the project.

```bash
cd gopocket
```

Install dependencies.

```bash
go mod tidy
```

Run the application.

```bash
go run main.go
```

The SQLite database will be created automatically, and all database migrations will run during startup.

---

## API Endpoints

### Categories

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | `/categories`     |
| GET    | `/categories`     |
| GET    | `/categories/:id` |
| PUT    | `/categories/:id` |
| DELETE | `/categories/:id` |

---

### Transactions

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | `/transactions`     |
| GET    | `/transactions`     |
| GET    | `/transactions/:id` |
| PUT    | `/transactions/:id` |
| DELETE | `/transactions/:id` |

---

## Design Principles

* Small and focused packages
* Clear separation of concerns
* Explicit dependency injection
* Thin HTTP layer
* Business logic isolated in services
* Persistence isolated in repositories
* Models separated from API contracts
* Consistent response format
* Easy to extend and maintain

---

## Planned Features

* Authentication
* User accounts
* Monthly reports
* Dashboard statistics
* Search and filtering
* Pagination
* Budgets
* Savings goals
* Recurring transactions
* Transaction splitting
* Tags
* CSV import/export
* Swagger documentation
* Docker support
* Unit and integration tests

---

## License

This project is open source and available under the MIT License.
