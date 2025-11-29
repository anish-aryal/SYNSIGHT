import api from '../apiService';

// Login
export const loginUser = async (credentials, { onLoggedIn, onOtpRequired } = {}) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    if (data.success) {
      if (data.requiresOtp) {
        if (onOtpRequired) onOtpRequired(data);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        if (onLoggedIn) onLoggedIn(data);
      }
    }

    return data;
  } catch (error) {
    // Return error data for requiresVerification check
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Register
export const registerUser = async (payload, { onRegistered } = {}) => {
  const response = await api.post('/auth/register', payload);
  const data = response.data;

  if (data.success && onRegistered) {
    onRegistered(data);
  }

  return data;
};

// Verify OTP
export const verifyOtp = async (payload, { onVerified } = {}) => {
  const response = await api.post('/auth/verify-otp', payload);
  const data = response.data;

  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    if (onVerified) onVerified(data);
  }

  return data;
};

// Resend OTP
export const resendOtp = async (payload) => {
  const response = await api.post('/auth/resend-otp', payload);
  return response.data;
};

// Logout
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Get current user
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};