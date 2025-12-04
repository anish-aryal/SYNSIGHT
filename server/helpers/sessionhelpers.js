import Session from '../models/Session.js';

export const createUserSession = async (userId, token, req) => {
  try {
    
    const { browser, os, device } = parseUserAgent(req.headers['user-agent']);
    
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const session = await Session.create({
      userId,
      token,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      device,
      browser,
      os,
      expiresAt
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const parseUserAgent = (userAgent) => {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Unknown Device';

  if (!userAgent) {
    return { browser, os, device };
  }

  // Parse Browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // Parse OS
  if (userAgent.includes('Windows')) {
    os = 'Windows';
    device = 'Windows PC';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
    device = 'Mac';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
    device = 'Linux PC';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    device = 'Android Device';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    device = userAgent.includes('iPad') ? 'iPad' : 'iPhone';
  }

  return { browser, os, device };
};

export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};