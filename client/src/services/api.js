// Reusable Axios HTTP Client
// Full Stack Concept: HTTP Client & Centralized API Interceptors

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to unwrap data and normalize errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Extract server error message or provide fallback
    const serverMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Network error. Please verify the backend server is running.';

    const details = error.response?.data?.error?.details || null;

    const formattedError = new Error(serverMessage);
    formattedError.status = error.response?.status;
    formattedError.details = details;

    return Promise.reject(formattedError);
  }
);

export default api;
