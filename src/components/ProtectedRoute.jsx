import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (user.email_verified === false) {
    return <Navigate to={`/verify-email-sent?email=${encodeURIComponent(user.email)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;