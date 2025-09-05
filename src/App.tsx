import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SessionExpiredDialog } from './components/SessionExpiredDialog';
import { PrivateRoute } from './components/PrivateRoute';
import { AppLayout } from './components/AppLayout';
import { WalletPage } from './pages/WalletPage';
import { WalletList } from './components/WalletList';
import { TransactionsPage } from './pages/TransactionsPage';
import { LoginPage } from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 2,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnReconnect: true
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <CssBaseline />
            <SessionExpiredDialog />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<PrivateRoute><AppLayout><WalletList /></AppLayout></PrivateRoute>} />
              <Route path="/setup-wallet" element={<PrivateRoute><AppLayout><WalletPage /></AppLayout></PrivateRoute>} />
              <Route path="/wallet/:id" element={<PrivateRoute><AppLayout><WalletPage /></AppLayout></PrivateRoute>} />
              <Route path="/transactions/:id" element={<PrivateRoute><AppLayout><TransactionsPage /></AppLayout></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;