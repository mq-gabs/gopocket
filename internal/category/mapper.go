package category

import "gopocket/internal/transaction/transactiontype"

// ToResponse maps the database model to the public DTO.
func ToResponse(model *Category) CategoryResponse {
	return CategoryResponse{
		ID:    model.ID,
		Name:  model.Name,
		Color: model.Color,
		Icon:  model.Icon,
		Type:  string(model.Type),
	}
}

// CreateRequestToModel maps a create request DTO to the database model.
func CreateRequestToModel(dto CreateCategoryRequest) Category {
	return Category{
		Name:  dto.Name,
		Color: dto.Color,
		Icon:  dto.Icon,
		Type:  transactiontype.TransactionType(dto.Type),
	}
}

// UpdateRequestToModel maps an update request DTO to the database model.
func UpdateRequestToModel(dto UpdateCategoryRequest) Category {
	return Category{
		Name:  dto.Name,
		Color: dto.Color,
		Icon:  dto.Icon,
		Type:  transactiontype.TransactionType(dto.Type),
	}
}
