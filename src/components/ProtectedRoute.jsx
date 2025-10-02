import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const access = localStorage.getItem('access_token');
  if (!access) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}