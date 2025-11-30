import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );
  const [notifications, setNotifications] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification };
    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (message) => {
    addNotification({ type: 'success', message });
  };

  const showError = (message) => {
    addNotification({ type: 'danger', message });
  };

  const showInfo = (message) => {
    addNotification({ type: 'info', message });
  };

  const showWarning = (message) => {
    addNotification({ type: 'warning', message });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const value = {
    theme,
    toggleTheme,
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    sidebarCollapsed,
    toggleSidebar,
    globalLoading,
    setGlobalLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// CHANGED: Function declaration instead of arrow function
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}