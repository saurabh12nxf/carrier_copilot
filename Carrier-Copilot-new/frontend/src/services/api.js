import axios from 'axios';

// Get backend API base URL from Vite environment variables or fallback to local backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const formatApiError = (error) => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Already a string
  if (typeof error === 'string') {
    return error;
  }

  // Check network error flag
  if (error.isNetworkError) {
    return error.message;
  }

  const data = error.response?.data;
  if (data) {
    // 1. detail is a simple string
    if (typeof data.detail === 'string') {
      return data.detail;
    }

    // 2. detail is a FastAPI Pydantic validation error array: [{loc, msg, type}, ...]
    if (Array.isArray(data.detail)) {
      const messages = data.detail.map((item) => {
        if (typeof item === 'string') return item;
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : '';
        const msg = item?.msg || 'Invalid input';
        return field ? `${field}: ${msg}` : msg;
      });
      return messages.join('. ');
    }

    // 3. detail is an object
    if (data.detail && typeof data.detail === 'object') {
      return data.detail.msg || data.detail.message || JSON.stringify(data.detail);
    }

    // 4. errors array (from custom FastAPI handler)
    if (Array.isArray(data.errors)) {
      const messages = data.errors.map((item) => {
        if (typeof item === 'string') return item;
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : '';
        const msg = item?.msg || 'Invalid input';
        return field ? `${field}: ${msg}` : msg;
      });
      return messages.join('. ');
    }

    // 5. data.message string
    if (typeof data.message === 'string') {
      return data.message;
    }
  }

  if (typeof error.message === 'string' && error.message !== '[object Object]') {
    return error.message;
  }

  return 'An error occurred while connecting to the server.';
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

// Request interceptor: Automatically attach JWT Bearer token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'dummy-token') {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For multipart/form-data uploads, remove manual Content-Type so the browser sets the boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract user-friendly error strings & auto-expire bad sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error / server not reachable
      const networkError = new Error(
        `Cannot connect to backend server at ${API_BASE_URL}. Please ensure your backend is running.`
      );
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Auto-clear stale session on 401 Unauthorized for protected endpoints
    const reqUrl = error.config?.url || '';
    const isAuthEndpoint = reqUrl.includes('/api/auth/login') || reqUrl.includes('/api/auth/signup');
    if (error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }

    // Normalize error.message to always be a safe, human-readable string
    error.message = formatApiError(error);
    return Promise.reject(error);
  }
);

export default api;
