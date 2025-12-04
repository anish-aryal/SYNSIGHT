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

    // Validate fullName (required field)
    if (!fullName || !fullName.trim()) {
      return sendErrorResponse(res, 'Full name is required', 400);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Update fields if provided
    const fieldsToUpdate = { 
      fullName: fullName.trim(), 
      company: company?.trim() || '', 
      role: role?.trim() || '', 
      avatar 
    };
    
    Object.keys(fieldsToUpdate).forEach(field => {
      if (fieldsToUpdate[field] !== undefined) {
        user[field] = fieldsToUpdate[field];
      }
    });

    await user.save();

    return sendSuccessResponse(res, 'Profile updated successfully', user.getPublicProfile());
  } catch (error) {
    console.error('Update profile error:', error);
    return sendErrorResponse(res, 'Failed to update profile', 500);
  }
};

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

    // Validate language if provided
    const validLanguages = ['en', 'es', 'fr', 'de', 'np'];
    if (language && !validLanguages.includes(language)) {
      return sendErrorResponse(res, 'Invalid language selection', 400);
    }

    // Validate defaultTimeRange if provided
    const validTimeRanges = ['last7days', 'last30days', 'last90days', 'lastyear', 'alltime'];
    if (defaultTimeRange && !validTimeRanges.includes(defaultTimeRange)) {
      return sendErrorResponse(res, 'Invalid time range selection', 400);
    }

    // Validate defaultPlatform if provided
    const validPlatforms = ['all', 'twitter', 'facebook', 'instagram', 'linkedin', 'reddit'];
    if (defaultPlatform && !validPlatforms.includes(defaultPlatform)) {
      return sendErrorResponse(res, 'Invalid platform selection', 400);
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

    return sendSuccessResponse(res, 'Preferences updated successfully', user.getPublicProfile());
  } catch (error) {
    console.error('Update preferences error:', error);
    return sendErrorResponse(res, 'Failed to update preferences', 500);
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

    if (newPassword.length < 8) {
      return sendErrorResponse(res, 'New password must be at least 8 characters', 400);
    }

    if (currentPassword === newPassword) {
      return sendErrorResponse(res, 'New password must be different from current password', 400);
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

    return sendSuccessResponse(res, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return sendErrorResponse(res, 'Failed to change password', 500);
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

    // Clear cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    return sendSuccessResponse(res, 'Account deleted successfully');
  } catch (error) {
    console.error('Delete account error:', error);
    return sendErrorResponse(res, 'Failed to delete account', 500);
  }
};

// @desc    Toggle Two-Factor Authentication
// @route   PUT /api/profile/two-factor
// @access  Private
export const toggleTwoFactor = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return sendErrorResponse(res, 'Invalid request. Enabled must be a boolean', 400);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Update two-factor status
    user.twoFactorEnabled = enabled;
    await user.save();

    const message = enabled 
      ? 'Two-factor authentication enabled successfully' 
      : 'Two-factor authentication disabled successfully';

    return sendSuccessResponse(res, message, user.getPublicProfile());
  } catch (error) {
    console.error('Toggle two-factor error:', error);
    return sendErrorResponse(res, 'Failed to update two-factor authentication', 500);
  }
};

// @desc    Get Active Sessions
// @route   GET /api/profile/sessions
// @access  Private
export const getActiveSessions = async (req, res) => {
  try {
    // Mock data for now - In production, you'd fetch from a sessions collection/cache
    const sessions = [
      {
        id: '1',
        device: 'MacBook Pro',
        browser: 'Chrome',
        os: 'macOS',
        lastActive: 'now',
        isCurrent: true,
        ipAddress: req.ip,
        createdAt: new Date()
      }
    ];

    return sendSuccessResponse(res, 'Active sessions retrieved successfully', sessions);
  } catch (error) {
    console.error('Get active sessions error:', error);
    return sendErrorResponse(res, 'Failed to retrieve active sessions', 500);
  }
};

// @desc    Terminate Session
// @route   DELETE /api/profile/sessions/:sessionId
// @access  Private
export const terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return sendErrorResponse(res, 'Session ID is required', 400);
    }

    // Mock implementation - In production, you'd:
    // 1. Find the session in your sessions collection/cache
    // 2. Verify it belongs to the current user
    // 3. Delete the session
    // 4. Invalidate the JWT token associated with that session

    // For now, just return success
    return sendSuccessResponse(res, 'Session terminated successfully');
  } catch (error) {
    console.error('Terminate session error:', error);
    return sendErrorResponse(res, 'Failed to terminate session', 500);
  }
};