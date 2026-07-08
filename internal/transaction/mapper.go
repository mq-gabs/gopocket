package transaction

// ToResponse maps the database model to the public DTO.
func ToResponse(model *Transaction) TransactionResponse {
	return TransactionResponse{
		ID:          model.ID,
		Title:       model.Title,
		Description: model.Description,
		Amount:      model.Amount,
		Type:        string(model.Type),
		CategoryID:  model.CategoryID,
	}
}

// CreateRequestToModel maps a create request DTO to the database model.
func CreateRequestToModel(dto CreateTransactionRequest) Transaction {
	return Transaction{
		Title:       dto.Title,
		Description: dto.Description,
		Amount:      dto.Amount,
		Type:        TransactionType(dto.Type),
		CategoryID:  dto.CategoryID,
	}
}

// UpdateRequestToModel maps an update request DTO to the database model.
func UpdateRequestToModel(dto UpdateTransactionRequest) Transaction {
	return Transaction{
		Title:       dto.Title,
		Description: dto.Description,
		Amount:      dto.Amount,
		Type:        TransactionType(dto.Type),
		CategoryID:  dto.CategoryID,
	}
}
