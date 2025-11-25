// src/api/authApi.js
import axiosClient from './axiosClient';

export const registerRequest = (userData) => {
  return axiosClient.post('/auth/register', userData);
};

export const loginRequest = (credentials) => {
  return axiosClient.post('/auth/login', credentials);
};
