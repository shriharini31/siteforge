import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};
