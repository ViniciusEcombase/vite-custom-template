import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contextProviders/AuthProvider';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a loading spinner

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
