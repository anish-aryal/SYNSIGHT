import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifyOtp as verifyOtpService, resendOtp as resendOtpService, logoutUser } from '../services/authService';

// Auth context state and actions.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || 'null')
  );
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authLoading, setAuthLoading] = useState(false);

  const clearLogoutFlags = () => {
    sessionStorage.removeItem('loggedOut');
    sessionStorage.removeItem('sessionExpired');
    sessionStorage.removeItem('suppressSessionExpired');
  };

  // Sync logout across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setUser(null);
        setToken(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      return await loginUser(credentials, {
        onLoggedIn: (res) => {
          setToken(res.token);
          setUser(res.data);
          clearLogoutFlags();
        },
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);
    try {
      return await registerUser(payload);
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyOtp = async (payload) => {
    setAuthLoading(true);
    try {
      return await verifyOtpService(payload, {
        onVerified: (res) => {
          setToken(res.token);
          setUser(res.data);
          clearLogoutFlags();
        },
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const resendOtp = async (payload) => {
    return await resendOtpService(payload);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    authLoading,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// CHANGED: Function declaration instead of arrow function
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
