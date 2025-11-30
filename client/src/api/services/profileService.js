import api from '../apiService';

// Update profile information
export const updateProfile = async (payload) => {
  try {
    const response = await api.put('/profile', payload);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong while updating profile';
    throw new Error(errorMessage);
  }
};

// Update preferences
export const updatePreferences = async (payload) => {
  try {
    const response = await api.put('/profile/preferences', payload);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong while updating preferences';
    throw new Error(errorMessage);
  }
};

// Change password
export const changePassword = async (payload) => {
  try {
    const response = await api.put('/profile/change-password', payload);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong while changing password';
    throw new Error(errorMessage);
  }
};

// Delete account
export const deleteAccount = async (password) => {
  try {
    const response = await api.delete('/profile', {
      data: { password }
    });
    
    if (response.data.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong while deleting account';
    throw new Error(errorMessage);
  }
};