import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  }, [removeNotification]);

  const showSuccess = useCallback((message) => {
    addNotification({ type: 'success', message });
  }, [addNotification]);

  const showError = useCallback((message) => {
    addNotification({ type: 'danger', message });
  }, [addNotification]);

  const showInfo = useCallback((message) => {
    addNotification({ type: 'info', message });
  }, [addNotification]);

  const showWarning = useCallback((message) => {
    addNotification({ type: 'warning', message });
  }, [addNotification]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const value = useMemo(() => ({
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
  }), [
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
    globalLoading
  ]);

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
