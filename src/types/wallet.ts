export interface Wallet {
  id: string;
  name: string;
  balance: number;
  date: string;
}

export interface WalletSetup {
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  balance: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  date: string;
}

export interface TransactionCreate {
  amount: number;
  description: string;
}

export interface TransactionResponse {
  balance: number;
  transactionId: string;
}

export interface TransactionQueryParams {
  skip?: number;
  limit?: number;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}
