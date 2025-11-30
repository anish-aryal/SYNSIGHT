import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../api/context/AuthContext';

export default function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}