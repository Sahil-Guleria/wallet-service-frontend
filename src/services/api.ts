import axios from 'axios';
import config from '../config/api';

const api = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
  createWallet: async (data: { name: string; balance: number }) => {
    const response = await api.post(config.endpoints.wallets, data);
    return response.data;
  },
  getWallets: async () => {
    const response = await api.get(config.endpoints.wallets);
    return response.data;
  },
  getWallet: async (id: string) => {
    const response = await api.get(`${config.endpoints.wallets}/${id}`);
    return response.data;
  },
  getTransactions: async (walletId: string, params?: any) => {
    const response = await api.get(`${config.endpoints.transactions}/${walletId}`, { params });
    return response.data;
  },
  createTransaction: async (walletId: string, data: { amount: number; description: string }) => {
    const response = await api.post(`${config.endpoints.wallets}/transact/${walletId}`, data);
    return response.data;
  }
};

export default api;