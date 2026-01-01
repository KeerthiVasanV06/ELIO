import apiClient from "./apiClient";

// Helper to build full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace("/api", "");
  return `${baseUrl}${imagePath}`;
};

// Get all blogs (paginated)
export const getBlogs = (page = 1, limit = 10) => {
  return apiClient.get("/blogs", { params: { page, limit } });
};

// Get blogs by author ID
export const getBlogsByAuthor = (authorId) => {
  return apiClient.get(`/blogs/author/${authorId}`);
};

// Get single blog by slug
export const getBlogBySlug = (slug) => {
  return apiClient.get(`/blogs/${slug}`);
};

// Create blog (with FormData for file upload)
export const createBlog = (data) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("category", data.category);
  
  // Send tags as comma-separated string
  const tagsArray = Array.isArray(data.tags) ? data.tags : [];
  const tagsString = tagsArray.filter(t => t && t.length > 0).join(",");
  
  console.log("=== CREATE BLOG SERVICE ===");
  console.log("Tags array:", tagsArray);
  console.log("Tags string to send:", tagsString);
  
  formData.append("tags", tagsString);
  formData.append("status", data.status);
  
  if (data.coverImage instanceof File) {
    formData.append("coverImage", data.coverImage);
  }
  
  console.log("FormData being sent:", {
    title: data.title,
    content: data.content.substring(0, 50),
    category: data.category,
    tags: tagsString,
    status: data.status,
    coverImage: data.coverImage ? "yes" : "no"
  });
  
  return apiClient.post("/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Update blog (with FormData for file upload)
export const updateBlog = (id, data) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("category", data.category || "");
  
  // Send tags as comma-separated string
  const tagsArray = Array.isArray(data.tags) ? data.tags : [];
  const tagsString = tagsArray.filter(t => t && t.length > 0).join(",");
  
  formData.append("tags", tagsString);
  formData.append("status", data.status);
  
  if (data.coverImage instanceof File) {
    formData.append("coverImage", data.coverImage);
  }
  
  // Don't set Content-Type header - let axios/browser handle it for FormData
  return apiClient.put(`/blogs/${id}`, formData);
};

// Delete blog
export const deleteBlog = (id) => {
  return apiClient.delete(`/blogs/${id}`);
};

// Bookmark a blog
export const bookmarkBlog = (id) => {
  return apiClient.post(`/blogs/${id}/bookmark`);
};

// Unbookmark a blog
export const unbookmarkBlog = (id) => {
  return apiClient.post(`/blogs/${id}/unbookmark`);
};

export { getImageUrl };
