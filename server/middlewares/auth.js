import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token (automatically checks expiration)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists in database
    const session = await Session.findOne({ 
      token, 
      userId: decoded.id,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please login again.'
      });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email to continue'
      });
    }

    req.user = user;

    // Update session activity (optional - don't await to avoid slowing down requests)
    Session.findOneAndUpdate(
      { token, userId: user._id },
      { lastActive: new Date() }
    ).exec();

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};