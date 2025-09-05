import axios from 'axios';
import { Wallet, WalletSetup, Transaction, TransactionCreate, TransactionResponse, TransactionsResponse, TransactionQueryParams } from '../types/wallet';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Token handling is now done directly in the interceptor

const generateIdempotencyKey = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Adding auth token to request:', {
      url: config.url,
      token: token.substring(0, 10) + '...'
    });
  } else {
    console.warn('No auth token found for request:', config.url);
  }
  
  // Add Idempotency-Key for POST requests
  if (config.method?.toLowerCase() === 'post') {
    config.headers['Idempotency-Key'] = generateIdempotencyKey();
  }
  
  return config;
});

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
}

interface LoginResponse {
  status: string;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<void> => {
    await api.post('/auth/register', data);
  }
};

export const walletApi = {
  getWallets: async (): Promise<Wallet[]> => {
    const response = await api.get<{ data: Wallet[] }>('/wallet/wallets');
    console.log('Raw API response:', response.data);
    const wallets = response.data.data || [];
    console.log('Processed wallets:', wallets);
    return wallets;
  },
  setup: async (data: WalletSetup): Promise<Wallet> => {
    const response = await api.post('/wallet/setup', data);
    return response.data;
  },

  getWallet: async (id: string): Promise<Wallet> => {
    const response = await api.get(`/wallet/wallet/${id}`);
    return response.data;
  },

  transact: async (walletId: string, data: TransactionCreate): Promise<TransactionResponse> => {
    const response = await api.post(`/wallet/transact/${walletId}`, data);
    return response.data;
  },

  getTransactions: async (
    walletId: string,
    params: TransactionQueryParams = {}
  ): Promise<TransactionsResponse> => {
    const response = await api.get('/wallet/transactions', {
      params: { 
        walletId,
        skip: params.skip || 0,
        limit: params.limit || 10,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      },
    });
    return response.data;
  },

  downloadTransactionsPDF: async (walletId: string): Promise<Blob> => {
    const response = await api.get(`/wallet/transactions/${walletId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Create a custom event for authentication errors
export const AUTH_ERROR_EVENT = 'auth_error';
export const emitAuthError = (message: string = 'Session expired. Please login again.') => {
  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, { 
    detail: { message } 
  }));
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', { 
      url: response.config.url,
      status: response.status,
      data: response.data 
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    // Don't handle auth errors for login/register endpoints
    const isAuthEndpoint = error.config?.url?.match(/\/auth\/(login|register)$/);
    
    if (!isAuthEndpoint) {
      // Check for authentication errors
      const isAuthError = 
        (error.response?.status === 401 && error.response?.data?.error === 'Authentication Error') ||
        error.response?.data?.details?.some((detail: any) => 
          detail.field === 'token' && detail.message.includes('Invalid or expired token')
        );

      if (isAuthError) {
        // Clear stored token
        localStorage.removeItem('jwt_token');
        
        const errorMessage = error.response?.data?.details?.[0]?.message || 
                           error.response?.data?.message || 
                           'Invalid or expired token. Please login again.';
        
        // Emit auth error event with specific message
        emitAuthError(errorMessage);
        
        const authError = new Error(errorMessage);
        authError.name = 'AuthenticationError';
        return Promise.reject(authError);
      }
    }

    // Handle API errors
    const errorMessage = error.response?.data?.details?.[0]?.message 
      || error.response?.data?.message 
      || error.response?.data?.error 
      || 'An error occurred';
    
    const apiError = new Error(errorMessage);
    apiError.name = 'ApiError';
    (apiError as any).response = error.response;
    return Promise.reject(apiError);

    return Promise.reject(error);
  }
);
