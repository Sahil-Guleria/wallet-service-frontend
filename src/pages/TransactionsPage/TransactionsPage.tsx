import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { TransactionTable } from '../../components/TransactionTable';
import { WalletDisplay } from '../../components/WalletDisplay';

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: walletId } = useParams();

  if (!walletId) {
    navigate('/');
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/wallet/${walletId}`)}
            sx={{ mr: 2 }}
          >
            Back to Wallet
          </Button>
          <Typography variant="h5" component="h1">
            Transaction History
          </Typography>
        </Box>

        <Box mb={4}>
          <WalletDisplay walletId={walletId} />
        </Box>

        <Card>
          <CardContent>
            <TransactionTable walletId={walletId} />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
