import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// Types
export interface DashboardSummary {
  totalValue: number;
  totalCostBasis: number;
  totalGainLoss: number;
  percentGainLoss: number;
  positionCount: number;
  accountCount: number;
}

export interface AllocationByCategory {
  category: string;
  value: number;
  percentage: number;
  positionCount: number;
}

export interface AllocationByAccount {
  accountId: string;
  accountName: string;
  accountType: string;
  taxTreatment: string;
  value: number;
  costBasis: number;
  gainLoss: number;
  percentage: number;
  positionCount: number;
}

export interface AllocationByTax {
  taxTreatment: string;
  value: number;
  percentage: number;
  accountCount: number;
}

export interface TransactionStats {
  totalCount: number;
  totalInflows: number;
  totalOutflows: number;
  totalFees: number;
  netFlow: number;
}

export interface TopPosition {
  id: string;
  symbol?: string;
  name: string;
  currentValue: number;
  gainLoss: number;
  percentGainLoss: number;
  percentage: number;
}

export interface Performer {
  id: string;
  symbol?: string;
  name: string;
  gainLoss: number;
  percentGainLoss: number;
}

export interface MonthlyActivity {
  month: string;
  inflows: number;
  outflows: number;
  netFlow: number;
  count: number;
}

export interface RecentTransaction {
  id: string;
  transactionType: string;
  transactionDate: string;
  totalAmount: number;
  shares?: number;
  account?: {
    accountName: string;
  };
  position?: {
    name: string;
    symbol?: string;
  };
}

export interface DashboardData {
  summary: DashboardSummary;
  allocation: {
    byCategory: AllocationByCategory[];
    byAccount: AllocationByAccount[];
    byTaxTreatment: AllocationByTax[];
  };
  transactions: TransactionStats;
  topPositions: TopPosition[];
  topPerformers: Performer[];
  bottomPerformers: Performer[];
  recentActivity: RecentTransaction[];
  monthlyActivity: MonthlyActivity[];
}

export interface NetWorth {
  current: number;
  history: Array<{
    date: string;
    value: number;
  }>;
}

interface DashboardState {
  data: DashboardData | null;
  netWorth: NetWorth | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  netWorth: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchDashboardData = createAsyncThunk('dashboard/fetchData', async () => {
  const response = await api.get<DashboardData>('/dashboard');
  return response;
});

export const fetchNetWorth = createAsyncThunk('dashboard/fetchNetWorth', async () => {
  const response = await api.get<NetWorth>('/dashboard/net-worth');
  return response;
});

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      })

      // Fetch net worth
      .addCase(fetchNetWorth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetWorth.fulfilled, (state, action: PayloadAction<NetWorth>) => {
        state.loading = false;
        state.netWorth = action.payload;
      })
      .addCase(fetchNetWorth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch net worth data';
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
