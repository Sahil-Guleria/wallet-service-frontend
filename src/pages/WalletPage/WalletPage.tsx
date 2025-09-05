import React, { useEffect, useState } from 'react';
import { Container, Box, Button } from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { WalletSetup } from '../../components/WalletSetup';
import { WalletDisplay } from '../../components/WalletDisplay';
import { TransactionForm } from '../../components/TransactionForm';

export const WalletPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleWalletCreated = (newWalletId: string) => {
    navigate(`/wallet/${newWalletId}`);
  };

  if (!id) {
    return <WalletSetup onSuccess={handleWalletCreated} />;
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <WalletDisplay walletId={id} />
        
        <Box mb={3}>
          <Button
            component={Link}
            to={`/transactions/${id}`}
            variant="outlined"
            fullWidth
            size="large"
          >
            View All Transactions
          </Button>
        </Box>

        <TransactionForm walletId={id} />
      </Box>
    </Container>
  );
};