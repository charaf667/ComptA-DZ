import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

const AuthBasedRedirect = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? 
    <Navigate to="/dashboard" replace /> : 
    <Navigate to="/welcome" replace />;
};

export default AuthBasedRedirect;
