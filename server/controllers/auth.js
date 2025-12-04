import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { welcomeEmailTemplate } from '../utils/emailTemplates.js';
import {
  sendOtpEmail,
  findUserByEmailOrId,
  validateOtpInput,
  validateLoginCredentials,
  validateRegistrationData
} from'../helpers/authhelpers.js';
import {
  sendTokenResponse,
  sendSuccessResponse,
  sendErrorResponse,
  sendOtpRequiredResponse,
  sendVerificationRequiredResponse
} from '../helpers/responseHelpers.js';
import Session from '../models/Session.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    const validation = validateRegistrationData(fullName, email, password);
    if (!validation.isValid) {
      return sendErrorResponse(res, validation.message, 400);
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      if (!user.isVerified) {
        // Resend OTP to unverified user
        const emailSent = await sendOtpEmail(user, false);
        
        if (!emailSent) {
          return sendErrorResponse(res, 'Failed to send verification email', 500);
        }

        return sendSuccessResponse(
          res,
          'Verification code sent. Please check your email.',
          { email: user.email },
          200
        );
      } else {
        return sendErrorResponse(res, 'User already exists', 400);
      }
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password
    });

    // Send OTP email (this also saves the user)
    const emailSent = await sendOtpEmail(user, false);
    
    if (!emailSent) {
      return sendErrorResponse(res, 'Failed to send verification email. Please try again.', 500);
    }

    sendSuccessResponse(
      res,
      'Registration successful. Please check your email for verification code.',
      { email: user.email },
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};

// @desc    Verify OTP (for both registration and login)
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, userId } = req.body;

    // Validate input
    const validation = validateOtpInput(email, userId, otp);
    if (!validation.isValid) {
      return sendErrorResponse(res, validation.message, 400);
    }

    // Find user
    const user = await findUserByEmailOrId(User, email, userId);
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return sendErrorResponse(res, 'Invalid or expired OTP', 400);
    }

    // Clear OTP
    user.clearOTP();

    // Check if this is email verification (user not verified yet)
    const isEmailVerification = !user.isVerified;

    if (isEmailVerification) {
      user.isVerified = true;
      user.expiresAt = undefined;
    }

    // Save once at the end
    await user.save();

    // Send welcome email for new registrations
    if (isEmailVerification) {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to SYNSIGHT!',
          html: welcomeEmailTemplate(user.fullName)
        });
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
      }

      return await sendTokenResponse(user, res, 'Email verified successfully',200, req);
    }

    // This is login OTP verification
    sendTokenResponse(user, res, 'Login successful',200,req);
  } catch (error) {
    console.error('Verify OTP error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, userId } = req.body;

    // Validate input
    if (!email && !userId) {
      return sendErrorResponse(res, 'Please provide email or userId', 400);
    }

    // Find user
    const user = await findUserByEmailOrId(User, email, userId);
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Determine if this is login OTP or registration OTP
    const isLoginOtp = user.isVerified;

    // Send OTP email
    const emailSent = await sendOtpEmail(user, isLoginOtp);
    if (!emailSent) {
      return sendErrorResponse(res, 'Failed to send email', 500);
    }

    sendSuccessResponse(res, 'OTP sent successfully');
  } catch (error) {
    console.error('Resend OTP error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate credentials
    const validation = validateLoginCredentials(email, password);
    if (!validation.isValid) {
      return sendErrorResponse(res, validation.message, 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendErrorResponse(res, 'Email or Password is incorrect', 401);
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendErrorResponse(res, 'Email or Password is incorrect', 401);
    }

    // Check if verified
    if (!user.isVerified) {
      await sendOtpEmail(user, false);
      return sendVerificationRequiredResponse(
        res,
        user.email,
        'Email not verified. A new verification code has been sent.'
      );
    }

    // Check if 2FA is enabled
    if (user.preferences.twoFactorEnabled) {
      const emailSent = await sendOtpEmail(user, true);

      if (!emailSent) {
        return sendErrorResponse(res, 'Failed to send verification code', 500);
      }

      return sendOtpRequiredResponse(res, user._id, user.email);
    }

    // If 2FA not enabled, proceed with normal login
    return await sendTokenResponse(user, res, 'Login successful', 200, req);
  } catch (error) {
    console.error('Login error:', error);
    return sendErrorResponse(res, 'An error occurred during login', 500);
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // Delete the session from database
    if (token) {
      await Session.deleteOne({ token, userId: req.user._id });
    }

    // Clear cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    sendSuccessResponse(res, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    sendErrorResponse(res, 'Logout failed', 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    sendSuccessResponse(res, 'User retrieved successfully', user.getPublicProfile());
  } catch (error) {
    console.error('Get me error:', error);
    sendErrorResponse(res, error.message, 500);
  }
};