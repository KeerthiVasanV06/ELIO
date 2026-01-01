import apiClient from "./apiClient";

// Get all categories
export const getCategories = () => {
  return apiClient.get("/categories");
};

// Create a category (admin only)
export const createCategory = (data) => {
  return apiClient.post("/categories", data);
};

// Delete a category (admin only)
export const deleteCategory = (id) => {
  return apiClient.delete(`/categories/${id}`);
};
