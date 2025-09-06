import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { walletApi } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BalanceChartProps {
  walletId: string;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ walletId }) => {
  const theme = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', walletId, 0, 100], // Get last 100 transactions
    queryFn: () => walletApi.getTransactions(walletId, { skip: 0, limit: 100, sortBy: 'date', sortOrder: 'desc' }),
  });

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading chart...</Typography>
        </CardContent>
      </Card>
    );
  }

  const transactions = [...data.transactions].reverse();
  const chartData = {
    labels: transactions.map(t => new Date(t.date).toLocaleDateString('en-GB')),
    datasets: [
      {
        label: 'Balance',
        data: transactions.map(t => t.balance),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Balance History',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: string | number): string {
            if (typeof value === 'number') {
              return `₹${value.toFixed(2)}`;
            }
            return value;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Card>
      <CardContent>
        <Box height={300}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};
