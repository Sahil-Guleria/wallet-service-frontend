export interface WalletSetup {
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  date: string;
  balance: number;
}

export interface TransactionCreate {
  amount: number;  // Required, precision(4), min: -999999999.9999, max: 999999999.9999
  description: string;  // Required, min: 1, max: 200 characters
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  userId: string;
  created_at: string;
  updated_at: string;
  date: string;
}

export interface TransactionResponse {
  transaction: Transaction;
  balance: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export interface TransactionQueryParams {
  skip?: number;
  limit?: number;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface ValidationError {
  status: 'fail';
  error: 'Validation Error';
  details: Array<{
    field: string;
    message: string;
  }>;
}