import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach token to every request if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // If the data is FormData, let the browser set the Content-Type header with proper boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response handler (optional but powerful)
 * Auto logout on 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // optional: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export default apiClient;
