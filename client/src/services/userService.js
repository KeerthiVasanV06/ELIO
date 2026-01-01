import apiClient from "./apiClient";

// Get authenticated user's profile
export const getProfile = () => {
  return apiClient.get("/users/profile");
};

// Get user stats (articles, views, etc.)
export const getUserStats = (userId) => {
  return apiClient.get(`/users/stats/${userId}`);
};

// Update own profile (name, email)
export const updateProfile = (data) => {
  return apiClient.put("/users/profile", data);
};

// Change password
export const changePassword = (data) => {
  return apiClient.put("/users/profile/password", data);
};

// Admin: Get all users
export const getUsers = () => {
  return apiClient.get("/users");
};

// Admin: Get user by ID
export const getUserById = (id) => {
  return apiClient.get(`/users/${id}`);
};

// Admin: Update user role
export const updateUserRole = (id, role) => {
  return apiClient.put(`/users/${id}/role`, { role });
};

// Admin: Delete user
export const deleteUser = (id) => {
  return apiClient.delete(`/users/${id}`);
};
