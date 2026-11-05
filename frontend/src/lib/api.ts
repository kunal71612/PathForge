import axios, { AxiosError } from 'axios';
import { getApiBaseUrl, API_TIMEOUT_MS } from '../config/api';

export const API_URL = getApiBaseUrl();

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT_MS,
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pathforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for error handling & controlled 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthLoginOrRegister = url.includes('/auth/login') || url.includes('/auth/register');

    // ONLY redirect to /login if genuinely 401 Unauthorized ON A PROTECTED ROUTE
    // (Never redirect on login failure, 403, 404, 500, or network timeouts)
    if (status === 401 && !isAuthLoginOrRegister) {
      localStorage.removeItem('pathforge_token');
      localStorage.removeItem('pathforge_user');
      const currentPath = window.location.pathname;
      if (
        currentPath !== '/login' &&
        currentPath !== '/register' &&
        currentPath !== '/'
      ) {
        window.location.href = '/login?expired=1';
      }
    }

    // Distinguish errors accurately without hardcoding local addresses
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = 'The requested resource was not found on the server.';
    } else if (status === 500) {
      message = 'Internal server error. Please try again shortly.';
    } else if (error.code === 'ECONNABORTED') {
      message =
        'Request timed out. The backend server took too long to respond. If hosted on a free cloud tier (like Render), it may take up to 60 seconds to wake up from sleep. Please try again in a moment.';
    } else if (!error.response) {
      message = `Unable to reach backend server at ${API_URL}. Please verify the backend is running and that CORS allows requests from this domain.`;
    }

    const customError: ApiError = new Error(message);
    customError.status = status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default api;
