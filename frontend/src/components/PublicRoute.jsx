import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  // If user is already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, show the public page (login/register)
  return children;
};

export default PublicRoute;