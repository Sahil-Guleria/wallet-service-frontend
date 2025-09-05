const API_URL = 'https://wallet-service-backend-f1j0.onrender.com';

export const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return API_URL;
};

export default {
  baseURL: getApiUrl(),
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    wallets: '/wallet',
    transactions: '/wallet/transactions'
  }
};
