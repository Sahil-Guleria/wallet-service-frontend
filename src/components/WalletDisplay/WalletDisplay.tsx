import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  IconButton,
  Chip,
} from '@mui/material';
import { Refresh as RefreshIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../../services/api';

interface WalletDisplayProps {
  walletId: string;
}

export const WalletDisplay: React.FC<WalletDisplayProps> = ({ walletId }) => {
  const navigate = useNavigate();
  const {
    data: wallet,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['wallet', walletId],
    queryFn: () => walletApi.getWallet(walletId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (error) {
    const errorMessage = error instanceof Error 
      ? (error as any)?.response?.data?.message || error.message 
      : 'An error occurred';

    return (
      <Card sx={{ bgcolor: 'error.light', mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography color="error" variant="h6">
                Error loading wallet
              </Typography>
              <Typography color="error" variant="body2">
                {errorMessage}
              </Typography>
            </Box>
            <IconButton onClick={() => refetch()} size="small" color="error">
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div">
              {isLoading ? <Skeleton width={150} /> : wallet?.name}
            </Typography>
          </Box>
          <IconButton onClick={() => refetch()} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current Balance
        </Typography>
        
        {isLoading ? (
          <Skeleton width={200} height={60} />
        ) : (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h3" component="div" color="primary.main">
              ₹{(wallet?.balance ?? 0).toFixed(4)}
            </Typography>
            <Chip
              label={(wallet?.balance ?? 0) >= 0 ? 'Positive' : 'Negative'}
              color={(wallet?.balance ?? 0) >= 0 ? 'success' : 'error'}
              size="small"
            />
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Date: {wallet?.date ? new Date(wallet.date).toLocaleDateString() : '--'}
        </Typography>
      </CardContent>
    </Card>
  );
};
