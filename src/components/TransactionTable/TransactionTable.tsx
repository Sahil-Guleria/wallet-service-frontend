import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import { FileDownload as FileDownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { ThemeToggle } from '../ThemeToggle';
import { walletApi } from '../../services/api';
import { Transaction } from '../../types/wallet';

interface TransactionTableProps {
  walletId: string;
}

type Order = 'asc' | 'desc';
type OrderBy = 'date' | 'amount';

export const TransactionTable: React.FC<TransactionTableProps> = ({ walletId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('date');

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', walletId, page, rowsPerPage, orderBy, order],
    queryFn: () => walletApi.getTransactions(walletId, {
      skip: page * rowsPerPage,
      limit: rowsPerPage,
      sortBy: orderBy,
      sortOrder: order
    }),
  });

  const handleSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const downloadPDF = async () => {
    try {
      const blob = await walletApi.downloadTransactionsPDF(walletId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const exportToCSV = () => {
    if (!data?.transactions) return;

    const headers = ['Date', 'Type', 'Amount', 'Balance', 'Description'];
    const csvContent = [
      headers.join(','),
      ...data.transactions.map((tx: Transaction) => [
        tx.date ? new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A',
        tx.type,
        `₹${tx.amount.toFixed(4)}`,
        `₹${tx.balance.toFixed(4)}`,
        `"${tx.description.replace(/"/g, '""')}"` // Escape quotes for CSV
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Typography color="error">
        Error loading transactions: {error instanceof Error ? error.message : 'Unknown error'}
      </Typography>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <ThemeToggle />
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportToCSV}
            disabled={!data?.transactions?.length}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={downloadPDF}
            disabled={!data?.transactions?.length}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Type</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No transactions found</TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction: Transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'CREDIT' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                    >
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      ₹{Math.abs(transaction.amount).toFixed(4)}
                    </Typography>
                  </TableCell>
                  <TableCell>₹{transaction.balance.toFixed(4)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data?.total || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};
