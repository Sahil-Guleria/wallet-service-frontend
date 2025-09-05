import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute:', { 
    isAuthenticated, 
    path: location.pathname,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 10) + '...' : 'none'
  });

  if (!isAuthenticated || !token) {
    // Redirect to login page if not authenticated, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
