import axios from 'axios';

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

    console.log('API Interceptor Error:', {
      status,
      url,
      isAuthRoute: url.includes('/auth/'),
      shouldClearSession: status === 401 && !url.includes('/auth/')
    });

    // ONLY clear session on 401 from PROTECTED routes (NOT from /auth/ routes)
    if (status === 401 && !url.includes('/auth/')) {
      console.log('Session expired - clearing and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      console.log('Not clearing session - auth route or not 401');
    }

    // Always reject with the original error
    return Promise.reject(error);
  }
);

export default api;