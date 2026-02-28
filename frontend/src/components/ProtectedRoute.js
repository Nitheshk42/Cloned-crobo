import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../services/api';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  const accessToken = getAccessToken();

  console.log('ProtectedRoute check:', { user, accessToken }); // ← debug

  // If no user info OR no access token → redirect to login
  if (!user || !accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;