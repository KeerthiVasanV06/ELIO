import apiClient from "./apiClient";

// Get all comments for a blog
export const getCommentsByBlog = (blogId) => {
  return apiClient.get(`/comments/${blogId}`);
};

// Add a comment to a blog
export const addComment = (blogId, data) => {
  return apiClient.post(`/comments/${blogId}`, data);
};

// Delete a comment
export const deleteComment = (commentId) => {
  return apiClient.delete(`/comments/${commentId}`);
};
