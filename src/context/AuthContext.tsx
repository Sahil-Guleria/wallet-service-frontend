import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_ERROR_EVENT, authApi } from '../services/api';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('jwt_token');
    console.log('Initial auth token:', storedToken ? 'Present' : 'Not found');
    return storedToken;
  });

  const updateToken = (newToken: string | null) => {
    console.log('Updating auth token:', newToken ? 'New token set' : 'Token cleared');
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('jwt_token', newToken);
    } else {
      localStorage.removeItem('jwt_token');
    }
  };

  // These functions are now handled by handleLogin and handleRegister

  const handleLogout = React.useCallback((redirectToLogin: boolean = true) => {
    updateToken(null);
    if (redirectToLogin) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogin = React.useCallback(async (username: string, password: string) => {
    try {
             const response = await authApi.login({ username, password });
      // Store the raw token
      const token = response.data.token;
      updateToken(token);
      // Navigate to home page after successful login
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.details?.[0]?.message 
        || error.response?.data?.message 
        || error.response?.data?.error 
        || 'Login failed';
      throw new Error(errorMessage);
    }
  }, []);

  const handleRegister = React.useCallback(async (username: string, password: string, email: string) => {
    try {
             await authApi.register({ username, password, email });
    } catch (error: any) {
      const errorMessage = error.response?.data?.details?.[0]?.message 
        || error.response?.data?.message 
        || error.response?.data?.error 
        || 'Registration failed';
      throw new Error(errorMessage);
    }
  }, []);

  // Listen for authentication errors
  useEffect(() => {
    const handleAuthError = (event: CustomEvent<{ message: string }>) => {
      // Clear token and redirect to login
      handleLogout(true);
      
      // Show error message
      const message = event.detail?.message || 'Session expired. Please login again.';
      // You can add a toast/alert library here to show the message
      console.error('Authentication Error:', message);
    };

    // Add event listener with type assertion
    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError as EventListener);
    return () => {
      window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError as EventListener);
    };
  }, [handleLogout]);

  const contextValue = React.useMemo(
    () => ({
      token,
      setToken: updateToken,
      isAuthenticated: !!token,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout
    }),
    [token, handleLogin, handleRegister, handleLogout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
