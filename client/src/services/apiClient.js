import axios from "axios";

/**
 * Axios instance
 * Uses backend URL from Vercel env
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Attach JWT token to every request (if exists)
 */
apiClient.interceptors.request.use(
  (config) => {
    // Let browser set boundary for FormData
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
 * Global response handler
 * Auto logout on 401 (expired / invalid token)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // optional redirect:
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
