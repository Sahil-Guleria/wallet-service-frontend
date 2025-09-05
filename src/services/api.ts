import axios from 'axios';
import config from '../config/api';
import { Wallet, WalletSetup, TransactionCreate, TransactionResponse, TransactionsResponse, TransactionQueryParams } from '../types/wallet';

export const AUTH_ERROR_EVENT = 'auth_error';
export const SESSION_EXPIRED_EVENT = 'session_expired';

const api = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Custom event for authentication errors
const authErrorEvent = new CustomEvent(AUTH_ERROR_EVENT);
const sessionExpiredEvent = new CustomEvent(SESSION_EXPIRED_EVENT);

const generateIdempotencyKey = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('jwt_token');
    console.log('Request interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    });
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Idempotency-Key for POST requests
    if (config.method?.toLowerCase() === 'post' && config.headers) {
      const idempotencyKey = generateIdempotencyKey();
      config.headers['Idempotency-Key'] = idempotencyKey;
      console.log('Added Idempotency-Key:', idempotencyKey);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        window.dispatchEvent(sessionExpiredEvent);
      } else if (error.response.status === 403) {
        // Authentication failed
        window.dispatchEvent(authErrorEvent);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post(config.endpoints.login, credentials);
    return response.data;
  },
  register: async (userData: { username: string; password: string; email: string }) => {
    const response = await api.post(config.endpoints.register, userData);
    return response.data;
  }
};


export const walletApi = {
  createWallet: async (data: WalletSetup): Promise<Wallet> => {
    console.log('Creating wallet:', { data });
    const response = await api.post(config.endpoints.create, data);
    return response.data;
  },
  getWallets: async (): Promise<Wallet[]> => {
    console.log('Fetching wallets');
    const response = await api.get(config.endpoints.wallets);
    console.log('Wallets response:', response.data);
    // Ensure we return the array from the data property
    return response.data.data || [];
  },
  getWallet: async (id: string): Promise<Wallet> => {
    console.log('Fetching wallet:', { id });
    const response = await api.get(`${config.endpoints.wallet}/${id}`);
    return response.data;
  },
  getTransactions: async (walletId: string, params?: TransactionQueryParams): Promise<TransactionsResponse> => {
    console.log('Fetching transactions:', { walletId, params });
    const response = await api.get(config.endpoints.transactions, {
      params: { walletId, ...params }
    });
    return response.data;
  },
  createTransaction: async (walletId: string, data: TransactionCreate): Promise<TransactionResponse> => {
    console.log('Creating transaction:', { walletId, data });

    // Get current wallet balance first
    const wallet = await walletApi.getWallet(walletId);
    console.log('Current wallet balance:', wallet.balance);

    // Check for insufficient balance on debit transactions
    if (data.amount < 0 && Math.abs(data.amount) > wallet.balance) {
      throw {
        status: 'fail',
        error: 'Validation Error',
        details: [{ 
          field: 'amount',
          message: `Insufficient balance. Current balance: ${wallet.balance.toFixed(4)}`
        }]
      };
    }

    // Validate transaction data
    if (!data.amount && data.amount !== 0) {
      throw {
        status: 'fail',
        error: 'Validation Error',
        details: [{ field: 'amount', message: 'amount is required' }]
      };
    }

    // Validate amount precision
    const amount = Number(data.amount.toFixed(4));
    
    // Check for valid number
    if (isNaN(amount) || !isFinite(amount)) {
      throw {
        status: 'fail',
        error: 'Validation Error',
        details: [{ field: 'amount', message: 'amount must be a valid number' }]
      };
    }

    // Check for zero amount
    if (amount === 0) {
      throw {
        status: 'fail',
        error: 'Validation Error',
        details: [{ field: 'amount', message: 'amount cannot be zero' }]
      };
    }

    // Check for amount limits
    if (Math.abs(amount) > 999999999.9999) {
      throw {
        status: 'fail',
        error: 'Validation Error',
        details: [{ field: 'amount', message: 'amount cannot exceed 999,999,999.9999' }]
      };
    }

    // Double-check balance for debit transactions
    if (amount < 0) {
      const requiredBalance = Math.abs(amount);
      if (requiredBalance > wallet.balance) {
        throw {
          status: 'fail',
          error: 'Validation Error',
          details: [{ 
            field: 'amount',
            message: `Insufficient balance. Trying to debit ${requiredBalance.toFixed(4)} but current balance is ${wallet.balance.toFixed(4)}`
          }]
        };
      }
    }

    // Validate description
    if (!data.description || data.description.trim().length < 1) {
      throw {
        status: 'fail',
        error: 'Validation Error',
        details: [{ field: 'description', message: 'description is required' }]
      };
    }
    if (data.description.length > 200) {
      throw {
        status: 'fail',
        error: 'Validation Error',
        details: [{ field: 'description', message: 'description cannot exceed 200 characters' }]
      };
    }

    const response = await api.post(`${config.endpoints.transact}/${walletId}`, {
      amount,
      description: data.description.trim()
    });
    return response.data;
  },
  downloadTransactionsPDF: async (walletId: string): Promise<Blob> => {
    console.log('Downloading PDF:', { walletId });
    const response = await api.get(`${config.endpoints.transactions}/${walletId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
  setup: async (data: WalletSetup): Promise<Wallet> => {
    return walletApi.createWallet(data);
  },
  transact: async (walletId: string, data: TransactionCreate): Promise<TransactionResponse> => {
    return walletApi.createTransaction(walletId, data);
  }
};

export default api;