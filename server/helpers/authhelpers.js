import sendEmail from '../utils/sendEmail.js';
import { otpEmailTemplate, loginOtpTemplate } from '../utils/emailTemplates.js';

export const sendOtpEmail = async (user, isLoginOtp = false) => {
  try {
    // Generate OTP using user model method
    const otp = user.generateOTP();
    await user.save();

    // Determine email subject and template
    const emailSubject = isLoginOtp 
      ? 'Login Verification Code - SYNSIGHT'
      : 'Verify Your Email - SYNSIGHT';
    
    const emailTemplate = isLoginOtp 
      ? loginOtpTemplate(user.fullName, otp)
      : otpEmailTemplate(user.fullName, otp);

    // Send email
    await sendEmail({
      email: user.email,
      subject: emailSubject,
      html: emailTemplate
    });

    return true;
  } catch (error) {
    console.error('Send OTP email error:', error);
    return false;
  }
};


export const findUserByEmailOrId = async (User, email, userId) => {
  if (userId) {
    return await User.findById(userId);
  } else if (email) {
    return await User.findOne({ email });
  }
  return null;
};


export const validateOtpInput = (email, userId, otp) => {
  if (!email && !userId) {
    return {
      isValid: false,
      message: 'Please provide email or userId'
    };
  }

  if (!otp) {
    return {
      isValid: false,
      message: 'Please provide OTP'
    };
  }

  return { isValid: true };
};


export const validateLoginCredentials = (email, password) => {
  if (!email || !password) {
    return {
      isValid: false,
      message: 'Please provide email and password'
    };
  }

  return { isValid: true };
};


export const validateRegistrationData = (fullName, email, password) => {
  if (!fullName || !email || !password) {
    return {
      isValid: false,
      message: 'Please provide all required fields'
    };
  }

  return { isValid: true };
};