import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { walletApi } from '../../services/api';
import { TransactionCreate } from '../../types/wallet';

interface TransactionFormProps {
  walletId: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ walletId }) => {
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});
  const queryClient = useQueryClient();

  const { mutate: mutateTransaction, isPending: isLoading, error } = useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: TransactionCreate }) => 
      walletApi.transact(walletId, data),
    onSuccess: () => {
      // Reset form
      setAmount('');
      setDescription('');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', walletId] });
    },
    onError: (error: any) => {
      console.error('Transaction failed:', error);
      
      // Clear previous field errors
      setFieldErrors({});

      // Handle validation errors
      if (error?.details) {
        const newFieldErrors: Record<string, string> = {};
        error.details.forEach((detail: { field: string; message: string }) => {
          newFieldErrors[detail.field] = detail.message;
        });
        setFieldErrors(newFieldErrors);
      } else if (error?.response?.data?.details) {
        const newFieldErrors: Record<string, string> = {};
        error.response.data.details.forEach((detail: { field: string; message: string }) => {
          newFieldErrors[detail.field] = detail.message;
        });
        setFieldErrors(newFieldErrors);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    mutateTransaction({
      walletId,
      data: {
        amount: type === 'DEBIT' ? -numAmount : numAmount,
        description,
      }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          New Transaction
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error 
              ? error.message
              : (error as any)?.details?.[0]?.message || 
                (error as any)?.response?.data?.details?.[0]?.message ||
                'An error occurred'}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, newType) => newType && setType(newType)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="CREDIT" color="success">
              <AddIcon sx={{ mr: 1 }} /> Credit
            </ToggleButton>
            <ToggleButton value="DEBIT" color="error">
              <RemoveIcon sx={{ mr: 1 }} /> Debit
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            name="amount"
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setFieldErrors(prev => ({ ...prev, amount: undefined }));
            }}
            fullWidth
            required
            error={!!fieldErrors.amount}
            helperText={fieldErrors.amount}
            inputProps={{
              step: '0.0001',
              min: 0,
            }}
            sx={{ mb: 2 }}
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

          <TextField
            name="description"
            label="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setFieldErrors(prev => ({ ...prev, description: undefined }));
            }}
            fullWidth
            required
            error={!!fieldErrors.description}
            helperText={fieldErrors.description}
            multiline
            rows={2}
            sx={{ mb: 2 }}
            placeholder="Enter transaction description"
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !amount || !description}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {type === 'CREDIT' ? 'Add Funds' : 'Send Payment'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};
