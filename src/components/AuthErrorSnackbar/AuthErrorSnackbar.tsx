import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AUTH_ERROR_EVENT } from '../../services/api';

export const AuthErrorSnackbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthError = (event: CustomEvent<{ message: string }>) => {
      setMessage(event.detail?.message || 'Session expired. Please login again.');
      setOpen(true);
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError as EventListener);
    return () => {
      window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError as EventListener);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="error" variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};
