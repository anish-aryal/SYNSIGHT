import api from '../apiService';

// Profile Service API client helpers.

// Update Profile
export const updateProfile = async (payload) => {
  try {
    const response = await api.put('/profile', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
  }
};

// Upload Avatar
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/profile/avatar', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload avatar');
  }
};

// Update Preferences
export const updatePreferences = async (payload) => {
  try {
    const response = await api.put('/profile/preferences', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update preferences');
  }
};

// Update Password
export const updatePassword = async (payload) => {
  try {
    const response = await api.put('/profile/change-password', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update password');
  }
};

// Toggle Two-Factor Authentication
export const toggleTwoFactor = async (enabled) => {
  try {
    const response = await api.put('/profile/two-factor', { enabled });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update two-factor authentication');
  }
};

// Get Active Sessions
export const getActiveSessions = async () => {
  try {
    const response = await api.get('/profile/sessions');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch active sessions');
  }
};

// Terminate Session
export const terminateSession = async (sessionId) => {
  try {
    const response = await api.delete(`/profile/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to terminate session');
  }
};

// Delete Account
export const deleteAccount = async (password) => {
  try {
    const response = await api.delete('/profile', {
      data: { password }
    });
    
    // Clear localStorage after successful deletion
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete account');
  }
};
