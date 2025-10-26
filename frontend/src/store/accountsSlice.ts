import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

export interface Account {
  id: string;
  accountType: string;
  accountName: string;
  institution?: string;
  accountNumber?: string;
  taxTreatment: 'TAXABLE' | 'TAX_DEFERRED' | 'TAX_EXEMPT';
  owner?: string;
  beneficiaries?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  positions?: Array<{
    id: string;
    name: string;
    currentValue: number;
  }>;
  properties?: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
  }>;
}

interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  selectedAccount: Account | null;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
  selectedAccount: null,
};

// Async thunks
export const fetchAccounts = createAsyncThunk('accounts/fetchAccounts', async () => {
  const response = await api.get<{ accounts: Account[] }>('/accounts');
  return response.accounts;
});

export const fetchAccountById = createAsyncThunk(
  'accounts/fetchAccountById',
  async (accountId: string) => {
    const response = await api.get<{ account: Account }>(`/accounts/${accountId}`);
    return response.account;
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: Partial<Account>) => {
    const response = await api.post<{ account: Account }>('/accounts', accountData);
    return response.account;
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, data }: { id: string; data: Partial<Account> }) => {
    const response = await api.put<{ account: Account }>(`/accounts/${id}`, data);
    return response.account;
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (accountId: string) => {
    await api.delete(`/accounts/${accountId}`);
    return accountId;
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setSelectedAccount: (state, action: PayloadAction<Account | null>) => {
      state.selectedAccount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch accounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      });

    // Fetch account by ID
    builder
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAccount = action.payload;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch account';
      });

    // Create account
    builder
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.unshift(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create account';
      });

    // Update account
    builder
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.selectedAccount?.id === action.payload.id) {
          state.selectedAccount = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update account';
      });

    // Delete account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete account';
      });
  },
});

export const { setSelectedAccount, clearError } = accountsSlice.actions;
export default accountsSlice.reducer;
