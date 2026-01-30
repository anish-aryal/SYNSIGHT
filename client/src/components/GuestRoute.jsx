import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../api/context/AuthContext';

// Guest route guard for auth access.

export default function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
}