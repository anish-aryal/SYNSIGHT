import axios from 'axios';

const api = axios.create({
  baseURL:'http://localhost:8000/api',
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
    const data = error.response?.data || {};

    // Token expired or invalid - clear session and redirect
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject({ message: 'Session expired. Please login again.' });
    }

    return Promise.reject({
      message: data.message || 'Something went wrong',
      status,
      ...data
    });
  }
);

export default api;