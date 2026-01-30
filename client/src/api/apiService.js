import axios from 'axios';

// Shared API client configuration and interceptors.

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // ONLY clear session on 401 from PROTECTED routes (NOT from /auth/ routes)
    if (status === 401 && !url.includes('/auth/')) {
      console.log('Session expired - clearing and redirecting');

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const suppressSessionExpired = sessionStorage.getItem('suppressSessionExpired') === 'true';
      if (!suppressSessionExpired) {
        // Set session expired flag
        sessionStorage.setItem('sessionExpired', 'true');
        // Redirect to login
        window.location.href = '/login';
      }
    }

    // Always reject with the original error
    return Promise.reject(error);
  }
);

export default api;
