import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? '/api' : 'https://messwala-6jvj.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('messwala_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      localStorage.removeItem('messwala_token');
      localStorage.removeItem('messwala_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
