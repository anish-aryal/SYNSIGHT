import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './api/context/AppContext';
import { AuthProvider } from './api/context/AuthContext';
import { ChatProvider } from './api/context/ChatContext';
import NotificationToast from './components/NotificationToast/NotificationToast';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Explore from './pages/Explore/Explore';
import Chat from './pages/Chat/Chat';
import Reports from './pages/Reports/Reports';
import Projects from './pages/Projects/Projects';
import Settings from './pages/Settings/Settings';
import History from './pages/History/History';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Landing from './pages/Landing/Landing';
import VerifyOTP from './pages/Auth/VerifyOTP';
import 'bootstrap/dist/css/bootstrap.min.css';
import DesignSystem from './pages/DesignSystem';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <Router>
        <AuthProvider>
          <NotificationToast />
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Landing />} />
            <Route path="/design-system" element={<DesignSystem />} />

            {/* Guest Only Routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
            </Route>

            {/* Protected Routes - Wrapped with ChatProvider */}
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <ChatProvider>
                    <AppLayout />
                  </ChatProvider>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:chatId" element={<Chat />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/history" element={<History />} />
                <Route path="/data-sources" element={<div className="p-4">Data Sources Page</div>} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </AppProvider>
  </React.StrictMode>
);
