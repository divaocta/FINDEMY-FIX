import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('findemy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('findemy_token');
      localStorage.removeItem('findemy_user');
      // Redirect to login only if not already on login/register/landing pages
      const path = window.location.pathname;
      if (path !== '/' && path !== '/login' && path !== '/register' && path !== '/forgot-password' && path !== '/reset-password') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
