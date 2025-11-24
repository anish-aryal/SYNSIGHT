import generateToken from '../utils/generateToken.js';

export const sendTokenResponse = (user, res, message = 'Success', statusCode = 200) => {
  const token = generateToken(user._id);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  res.status(statusCode).json({
    success: true,
    message,
    data: user.getPublicProfile(),
    token
  });
};

export const sendSuccessResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export const sendErrorResponse = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

export const sendOtpRequiredResponse = (res, userId, email, message = 'Verification code sent to your email') => {
  res.status(200).json({
    success: true,
    requiresOtp: true,
    message,
    userId,
    email
  });
};

export const sendVerificationRequiredResponse = (res, email, message = 'Email not verified') => {
  res.status(403).json({
    success: false,
    message,
    requiresVerification: true,
    email
  });
};