import React, { useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Skeleton,
} from '@mui/material';
import { Add as AddIcon, AccountBalanceWallet } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../../services/api';
import { Wallet } from '../../types/wallet';

export const WalletList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
  }, [queryClient]);
  const { data: wallets = [], isLoading, error, isSuccess } = useQuery<Wallet[]>({
    queryKey: ['wallets'],
    queryFn: async () => {
      console.log('Fetching wallets...');
      const result = await walletApi.getWallets();
      console.log('Wallets result:', result);
      return result;
    },
    initialData: [],
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: true,
    staleTime: 0,
    gcTime: 0
  });

  const handleWalletClick = (walletId: string) => {
    navigate(`/wallet/${walletId}`);
  };

  const handleCreateWallet = () => {
    navigate('/setup-wallet');
  };

  if (error) {
    console.error('WalletList error:', error);
    return (
      <Typography color="error" align="center">
        Error loading wallets. Please try again later.
      </Typography>
    );
  }

  console.log('WalletList render:', { isLoading, isSuccess, wallets, error });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Wallets
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateWallet}
        >
          Create New Wallet
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
        {isLoading ? (
          [...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="20%" />
              </CardContent>
            </Card>
          ))
        ) : (
          wallets?.map((wallet: Wallet) => (
            <Card
              key={wallet.id}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => handleWalletClick(wallet.id)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalanceWallet color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {wallet.name}
                  </Typography>
                </Box>
                <Typography variant="h5" color="primary" gutterBottom>
                  ${wallet.balance.toFixed(4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(wallet.date).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {!isLoading && (!Array.isArray(wallets) || wallets.length === 0) && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No wallets found
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateWallet}
          >
            Create Your First Wallet
          </Button>
        </Box>
      )}
    </Box>
  );
};
