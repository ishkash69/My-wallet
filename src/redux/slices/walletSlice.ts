import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface WalletState {
  address: string | null;
  balance: string;
  privateKey: string | null;
  isLoading: boolean;
  error: string | null;
  transactions: Transaction[];
}

const initialState: WalletState = {
  address: null,
  balance: '0',
  privateKey: null,
  isLoading: false,
  error: null,
  transactions: [],
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Wallet actions
    setWallet: (state, action: PayloadAction<{ address: string; privateKey: string }>) => {
      state.address = action.payload.address;
      state.privateKey = action.payload.privateKey;
      state.error = null;
    },
    
    clearWallet: (state) => {
      state.address = null;
      state.privateKey = null;
      state.balance = '0';
      state.transactions = [];
      state.error = null;
    },

    // Balance actions
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },

    // Loading actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Error actions
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Transaction actions
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },

    updateTransaction: (
      state,
      action: PayloadAction<{ hash: string; status: 'pending' | 'confirmed' | 'failed' }>
    ) => {
      const transaction = state.transactions.find((tx) => tx.hash === action.payload.hash);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },

    clearTransactions: (state) => {
      state.transactions = [];
    },
  },
});

export const {
  setWallet,
  clearWallet,
  setBalance,
  setLoading,
  setError,
  clearError,
  addTransaction,
  updateTransaction,
  clearTransactions,
} = walletSlice.actions;

export default walletSlice.reducer;

