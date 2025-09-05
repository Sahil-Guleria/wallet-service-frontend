const getApiUrl = () => {
  // First priority: Environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Second priority: Development vs Production fallback
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://wallet-service-backend-f1j0.onrender.com';
};

export default {
  baseURL: getApiUrl(),
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    create: '/wallet/create',
    wallets: '/wallet/wallets',
    wallet: '/wallet/wallet',
    transactions: '/wallet/transactions',
    transact: '/wallet/transact'
  }
};