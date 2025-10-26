import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// Transaction Types
export type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'DIVIDEND'
  | 'DISTRIBUTION'
  | 'REINVESTMENT'
  | 'TRANSFER'
  | 'CORPORATE_ACTION'
  | 'CONTRIBUTION'
  | 'WITHDRAWAL'
  | 'EXPENSE'
  | 'INCOME';

export interface Transaction {
  id: string;
  accountId: string;
  positionId?: string;
  transactionType: TransactionType;
  transactionDate: string;
  settlementDate?: string;
  shares?: number;
  pricePerShare?: number;
  totalAmount: number;
  fees: number;
  description?: string;
  isReconciled: boolean;
  createdAt: string;
  updatedAt: string;
  account?: {
    accountName: string;
  };
  position?: {
    name: string;
    symbol?: string;
  };
  // Property-specific fields
  propertyId?: string;
  property?: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
  payee?: string;
  farmPayeeType?: string;
  rentalPayeeType?: string;
  revenue?: number;
  // Investment-specific fields (for standard accounts)
  fund?: string;
  changeInCapital?: number;
  distributions?: number;
  hsaCapitalChanges?: number;
}

export interface TransactionStats {
  totalTransactions: number;
  totalInflows: number;
  totalOutflows: number;
  netFlow: number;
  totalFees: number;
  byType: Record<string, number>;
}

interface TransactionsState {
  transactions: Transaction[];
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTransactions = createAsyncThunk('transactions/fetchAll', async () => {
  const response = await api.get<{ transactions: Transaction[] }>('/transactions');
  return response.transactions;
});

export const fetchTransactionStats = createAsyncThunk('transactions/fetchStats', async () => {
  const response = await api.get<TransactionStats>('/transactions/stats');
  return response;
});

export const fetchTransactionsByAccount = createAsyncThunk(
  'transactions/fetchByAccount',
  async (accountId: string) => {
    const response = await api.get<{ transactions: Transaction[] }>(
      `/transactions/account/${accountId}`
    );
    return response.transactions;
  }
);

export const fetchTransactionsByPosition = createAsyncThunk(
  'transactions/fetchByPosition',
  async (positionId: string) => {
    const response = await api.get<{ transactions: Transaction[] }>(
      `/transactions/position/${positionId}`
    );
    return response.transactions;
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (data: {
    accountId: string;
    positionId?: string;
    transactionType: TransactionType;
    transactionDate: string;
    settlementDate?: string;
    shares?: number;
    pricePerShare?: number;
    totalAmount: number;
    fees?: number;
    description?: string;
  }) => {
    const response = await api.post<{ transaction: Transaction }>('/transactions', data);
    return response.transaction;
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({
    id,
    data,
  }: {
    id: string;
    data: {
      transactionType?: TransactionType;
      transactionDate?: string;
      settlementDate?: string;
      shares?: number;
      pricePerShare?: number;
      totalAmount?: number;
      fees?: number;
      description?: string;
      isReconciled?: boolean;
    };
  }) => {
    const response = await api.put<{ transaction: Transaction }>(`/transactions/${id}`, data);
    return response.transaction;
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string) => {
    await api.delete(`/transactions/${id}`);
    return id;
  }
);

// Slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })

      // Fetch transaction stats
      .addCase(fetchTransactionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionStats.fulfilled, (state, action: PayloadAction<TransactionStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTransactionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transaction stats';
      })

      // Fetch by account
      .addCase(fetchTransactionsByAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByAccount.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionsByAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch account transactions';
      })

      // Fetch by position
      .addCase(fetchTransactionsByPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByPosition.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionsByPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch position transactions';
      })

      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create transaction';
      })

      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        const index = state.transactions.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update transaction';
      })

      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.transactions = state.transactions.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete transaction';
      });
  },
});

export const { clearError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
