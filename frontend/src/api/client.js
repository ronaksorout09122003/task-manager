import axios from "axios";
import { clearStoredToken, getStoredToken } from "../utils/storage";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  },
);

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export default api;
