import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - logout user
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Return error with formatted message
      const errorMessage = error.response.data?.message || 'An error occurred';
      const errors = error.response.data?.errors || [];

      return Promise.reject({
        statusCode: error.response.status,
        message: errorMessage,
        errors: errors,
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        statusCode: 0,
        message: 'Network error. Please check your connection.',
        errors: [],
      });
    } else {
      // Other errors
      return Promise.reject({
        statusCode: 0,
        message: error.message || 'An unexpected error occurred',
        errors: [],
      });
    }
  }
);

export default api;
