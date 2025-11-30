import api from '../apiService';

// Login
export const loginUser = async (credentials, { onLoggedIn, onOtpRequired } = {}) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    if (data.success) {
      if (data.requiresOtp) {
        if (onOtpRequired) onOtpRequired(data);
        return data;
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        if (onLoggedIn) onLoggedIn(data);
        return data;
      }
    }

    return data;
  } catch (error) {
    console.log('Login error in authService:', error);
    console.log('Error response:', error.response);
    console.log('Error response data:', error.response?.data);
    console.log('Error response status:', error.response?.status);

    // Check for requiresVerification (400 status)
    if (error.response?.status === 400 && error.response?.data?.requiresVerification) {
      console.log('Requires verification - returning data');
      return error.response.data;
    }

    // For 401 (invalid credentials), throw the error message
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      console.log('401 error - throwing:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // For all other errors
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    console.log('Other error - throwing:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Register
export const registerUser = async (payload, { onRegistered } = {}) => {
  try {
    const response = await api.post('/auth/register', payload);
    const data = response.data;

    if (data.success && onRegistered) {
      onRegistered(data);
    }

    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Registration failed');
  }
};

// Verify OTP
export const verifyOtp = async (payload, { onVerified } = {}) => {
  try {
    const response = await api.post('/auth/verify-otp', payload);
    const data = response.data;

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      if (onVerified) onVerified(data);
    }

    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'OTP verification failed');
  }
};

// Resend OTP
export const resendOtp = async (payload) => {
  try {
    const response = await api.post('/auth/resend-otp', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to resend OTP');
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Get current user
export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user data');
  }
};
