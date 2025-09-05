import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Get the return URL from location state or default to '/'
  const from = (location.state as any)?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error when user types
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Login form submitted with:', formData);
    setError(null);
    setIsLoading(true);

    try {
      console.log('Making login API call...');
      await login(formData.username, formData.password);
      console.log('Login successful');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error details:', {
        error: err,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 404) {
        setError('Login service not found. Please check the API endpoint.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom align="center">
              Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                autoFocus
                disabled={isLoading}
              />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading || !formData.username || !formData.password}
                sx={{ mt: 3 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </form>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <RouterLink to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Don't have an account? Sign up
                </Typography>
              </RouterLink>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
