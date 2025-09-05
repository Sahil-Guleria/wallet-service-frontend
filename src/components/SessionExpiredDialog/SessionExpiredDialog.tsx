import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { AUTH_ERROR_EVENT } from '../../services/api';

export const SessionExpiredDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleAuthError = () => {
      setOpen(true);
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
    return () => {
      window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    window.location.href = '/login';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="session-expired-dialog"
    >
      <DialogTitle id="session-expired-dialog">
        Session Expired
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your session has expired. Please login again to continue.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};
