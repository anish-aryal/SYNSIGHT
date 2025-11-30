import api from '../apiService';

// Update Profile
export const updateProfile = async (payload) => {
  try {
    const response = await api.put('/profile', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
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

// Change Password
export const changePassword = async (payload) => {
  try {
    const response = await api.put('/profile/change-password', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
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