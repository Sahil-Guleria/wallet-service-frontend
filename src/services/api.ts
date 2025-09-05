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

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    console.log('Request interceptor:', {
      url: config.url,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    });
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
    const response = await api.post(config.endpoints.wallets, data);
    return response.data;
  },
  getWallets: async (): Promise<Wallet[]> => {
    const response = await api.get(config.endpoints.wallets);
    return response.data;
  },
  getWallet: async (id: string): Promise<Wallet> => {
    const response = await api.get(`${config.endpoints.wallets}/${id}`);
    return response.data;
  },
  getTransactions: async (walletId: string, params?: TransactionQueryParams): Promise<TransactionsResponse> => {
    const response = await api.get(`${config.endpoints.transactions}/${walletId}`, { params });
    return response.data;
  },
  createTransaction: async (walletId: string, data: TransactionCreate): Promise<TransactionResponse> => {
    const response = await api.post(`${config.endpoints.wallets}/transact/${walletId}`, data);
    return response.data;
  },
  downloadTransactionsPDF: async (walletId: string): Promise<Blob> => {
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