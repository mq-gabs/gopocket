package category

// CreateCategoryRequest is the request payload for creating a category.
type CreateCategoryRequest struct {
	Name  string `json:"name"`
	Color string `json:"color,omitempty"`
	Icon  string `json:"icon,omitempty"`
	Type  string `json:"type"`
}

// UpdateCategoryRequest is the request payload for updating a category.
type UpdateCategoryRequest struct {
	Name  string `json:"name,omitempty"`
	Color string `json:"color,omitempty"`
	Icon  string `json:"icon,omitempty"`
	Type  string `json:"type,omitempty"`
}

// CategoryResponse is the public response payload for a category.
type CategoryResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color,omitempty"`
	Icon  string `json:"icon,omitempty"`
	Type  string `json:"type"`
}
