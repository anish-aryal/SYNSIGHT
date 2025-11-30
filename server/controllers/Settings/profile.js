import User from '../../models/User.js';
import {
  sendSuccessResponse,
  sendErrorResponse
} from '../../helpers/responseHelpers.js';

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, company, role, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Update fields if provided
    const fieldsToUpdate = { fullName, company, role, avatar };
    
    Object.keys(fieldsToUpdate).forEach(field => {
      if (fieldsToUpdate[field] !== undefined) {
        user[field] = fieldsToUpdate[field];
      }
    });

    await user.save();

    sendSuccessResponse(res, 'Profile updated successfully', user.getPublicProfile());
  } catch (error) {
    console.error('Update profile error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};

// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
  try {
    const { 
      emailNotifications,
      sentimentAlerts,
      weeklyDigest,
      productUpdates,
      weeklyReports,
      mentionAlerts,
      darkMode,
      twoFactorEnabled,
      language,
      timezone,
      defaultTimeRange,
      defaultPlatform
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Update preferences if provided
    const preferencesToUpdate = {
      emailNotifications,
      sentimentAlerts,
      weeklyDigest,
      productUpdates,
      weeklyReports,
      mentionAlerts,
      darkMode,
      twoFactorEnabled,
      language,
      timezone,
      defaultTimeRange,
      defaultPlatform
    };

    Object.keys(preferencesToUpdate).forEach(pref => {
      if (preferencesToUpdate[pref] !== undefined) {
        user.preferences[pref] = preferencesToUpdate[pref];
      }
    });

    await user.save();

    sendSuccessResponse(res, 'Preferences updated successfully', user.getPublicProfile());
  } catch (error) {
    console.error('Update preferences error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return sendErrorResponse(res, 'Please provide current and new password', 400);
    }

    if (newPassword.length < 6) {
      return sendErrorResponse(res, 'New password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendErrorResponse(res, 'Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendSuccessResponse(res, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};

// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return sendErrorResponse(res, 'Please provide your password to confirm', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendErrorResponse(res, 'Incorrect password', 401);
    }

    await User.findByIdAndDelete(req.user._id);

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    sendSuccessResponse(res, 'Account deleted successfully');
  } catch (error) {
    console.error('Delete account error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};