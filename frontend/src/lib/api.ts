import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6090/api";
export const STORAGE_URL = API_URL.replace('/api', '/storage');

const api = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 minutes
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
      }
    }
    // Handle maintenance mode (503)
    if (error.response?.status === 503 && error.response?.data?.maintenance) {
      if (typeof window !== "undefined" && window.location.pathname !== "/maintenance") {
        window.location.href = "/maintenance";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
