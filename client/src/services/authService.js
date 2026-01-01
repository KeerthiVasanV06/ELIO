import apiClient from "./apiClient";

export const registerUser = (data) => {
  return apiClient.post("/auth/register", data);
};

export const loginUser = (data) => {
  return apiClient.post("/auth/login", data);
};

export const getMe = () => {
  return apiClient.get("/auth/me");
};
