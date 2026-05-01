import axios from "axios";
import { clearStoredToken, getStoredToken } from "../utils/storage";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.DEV) {
  console.log("API base URL:", apiBaseUrl);
}

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_URL. Set it to your backend API URL before building the frontend.");
}

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

const fallbackMessage = "Something went wrong. Please try again.";

const statusMessages = {
  400: "Please check the form and try again.",
  401: "Session expired. Please sign in again.",
  403: "You do not have permission to do that.",
  404: "We could not find what you were looking for.",
  409: "This information is already in use.",
  422: "Please check the form and try again.",
  429: "Too many attempts. Please wait and try again.",
  500: fallbackMessage,
  502: "The server is temporarily unavailable. Please try again.",
  503: "The server is temporarily unavailable. Please try again.",
};

const safeServerMessages = new Set([
  "Account created",
  "At least one admin must remain",
  "At least one super admin must remain",
  "Current password is incorrect",
  "Email is already registered",
  "Invalid email or password",
  "Only one super admin is allowed",
  "Super admin can only create admin accounts",
  "Only a super admin can change roles",
  "Only a super admin can create admin accounts",
  "Password must be at least 6 characters",
  "Session expired. Please sign in again.",
  "Super admin role cannot be changed",
  "Tasks can only be assigned to members of the project",
]);

export const getErrorMessage = (error) => {
  if (!error) return fallbackMessage;

  if (error.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (!error.response) {
    return "Network error. Please check your connection and try again.";
  }

  const { status, data } = error.response;
  const firstDetail = Array.isArray(data?.details) ? data.details[0]?.message : null;
  const serverMessage = firstDetail || data?.message;

  if (serverMessage && (status === 400 || safeServerMessages.has(serverMessage))) {
    return serverMessage;
  }

  return statusMessages[status] || fallbackMessage;
};

export default api;
