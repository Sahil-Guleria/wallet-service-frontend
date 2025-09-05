import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { walletSetupSchema } from '../../utils/validationSchemas';
import { walletApi } from '../../services/api';
import { WalletSetup as WalletSetupType } from '../../types/wallet';

interface WalletSetupProps {
  onSuccess: (walletId: string) => void;
}

export const WalletSetup: React.FC<WalletSetupProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WalletSetupType>({
    resolver: yupResolver(walletSetupSchema),
    defaultValues: {
      name: '',
      balance: 0,
    },
  });

  const { mutate, isPending: isLoading, error } = useMutation({
    mutationFn: walletApi.setup,
    onSuccess: (data) => {
      onSuccess(data.id);
      // Store wallet ID in local storage as per requirements
      localStorage.setItem('walletId', data.id);
    },
  });

  const onSubmit = (data: WalletSetupType) => {
    mutate(data);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Setup Your Wallet
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error instanceof Error ? error.message : 'An error occurred'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('name')}
              label="Wallet Name"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
            />

            <TextField
              {...register('balance')}
              label="Initial Balance"
              type="number"
              fullWidth
              margin="normal"
              error={!!errors.balance}
              helperText={errors.balance?.message || 'Enter amount greater than 0 (up to 4 decimal places)'}
              disabled={isLoading}
              inputProps={{
                step: '0.0001',
                min: 0.0001,
                max: 999999999.9999,
                pattern: '^[0-9]*(.[0-9]{0,4})?$'
              }}
              InputProps={{
                startAdornment: (
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ mr: 1 }}
                  >
                    $
                  </Typography>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Wallet'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
