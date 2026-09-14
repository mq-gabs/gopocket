package category

// ToResponse maps the database model to the public DTO.
func ToResponse(model *Category) CategoryResponse {
	return CategoryResponse{
		ID:    model.ID,
		Name:  model.Name,
		Color: model.Color,
	}
}

// CreateRequestToModel maps a create request DTO to the database model.
func CreateRequestToModel(dto CreateCategoryRequest) Category {
	return Category{
		Name:  dto.Name,
		Color: dto.Color,
	}
}

// UpdateRequestToModel maps an update request DTO to the database model.
func UpdateRequestToModel(dto UpdateCategoryRequest) Category {
	return Category{
		Name:  dto.Name,
		Color: dto.Color,
	}
}
