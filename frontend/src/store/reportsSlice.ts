import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface ReportFilters {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'realized' | 'unrealized' | 'all';
}

export interface PerformanceReport {
  summary: {
    totalCurrentValue: number;
    totalCostBasis: number;
    totalUnrealizedGainLoss: number;
    totalRealizedGainLoss: number;
    totalReturn: number;
    totalReturnPercent: number;
  };
  positions: any[];
  performanceByPeriod: Array<{
    period: string;
    returnPercent: number;
    gainLoss: number;
  }>;
}

export interface AllocationReport {
  totalValue: number;
  byCategory: any[];
  bySubCategory: any[];
  byAccountType: any[];
  byTaxTreatment: any[];
}

export interface IncomeReport {
  summary: {
    totalIncome: number;
    transactionCount: number;
    averagePerTransaction: number;
  };
  byPosition: any[];
  byMonth: any[];
  byQuarter: any[];
  transactions: any[];
}

export interface ActivityReport {
  summary: {
    totalTransactions: number;
    totalInflows: number;
    totalOutflows: number;
    netFlow: number;
    totalFees: number;
  };
  byType: any[];
  byMonth: any[];
  recentTransactions: any[];
}

export interface GainLossReport {
  summary: {
    totalUnrealizedGainLoss: number;
    totalRealizedGainLoss: number;
    totalGainLoss: number;
  };
  unrealizedGains: any[];
  realizedGains: any[];
  allGains: any[];
}

export interface HoldingsReport {
  summary: {
    totalHoldings: number;
    totalValue: number;
    totalCostBasis: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  };
  holdings: any[];
}

interface ReportsState {
  performance: PerformanceReport | null;
  allocation: AllocationReport | null;
  income: IncomeReport | null;
  activity: ActivityReport | null;
  gainLoss: GainLossReport | null;
  holdings: HoldingsReport | null;
  filters: ReportFilters;
  loading: boolean;
  error: string | null;
  activeReport: 'performance' | 'allocation' | 'income' | 'activity' | 'gainLoss' | 'holdings';
}

const initialState: ReportsState = {
  performance: null,
  allocation: null,
  income: null,
  activity: null,
  gainLoss: null,
  holdings: null,
  filters: {},
  loading: false,
  error: null,
  activeReport: 'performance',
};

// Async thunks
export const fetchPerformanceReport = createAsyncThunk(
  'reports/fetchPerformance',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`${API_URL}/reports/performance?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch performance report');
    }
  }
);

export const fetchAllocationReport = createAsyncThunk(
  'reports/fetchAllocation',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);

      const response = await axios.get(`${API_URL}/reports/allocation?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch allocation report');
    }
  }
);

export const fetchIncomeReport = createAsyncThunk(
  'reports/fetchIncome',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`${API_URL}/reports/income?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch income report');
    }
  }
);

export const fetchActivityReport = createAsyncThunk(
  'reports/fetchActivity',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`${API_URL}/reports/activity?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch activity report');
    }
  }
);

export const fetchGainLossReport = createAsyncThunk(
  'reports/fetchGainLoss',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);

      const response = await axios.get(`${API_URL}/reports/gainloss?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch gain/loss report');
    }
  }
);

export const fetchHoldingsReport = createAsyncThunk(
  'reports/fetchHoldings',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);

      const response = await axios.get(`${API_URL}/reports/holdings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch holdings report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setActiveReport: (
      state,
      action: PayloadAction<'performance' | 'allocation' | 'income' | 'activity' | 'gainLoss' | 'holdings'>
    ) => {
      state.activeReport = action.payload;
    },
    setFilters: (state, action: PayloadAction<ReportFilters>) => {
      state.filters = action.payload;
    },
    clearReports: (state) => {
      state.performance = null;
      state.allocation = null;
      state.income = null;
      state.activity = null;
      state.gainLoss = null;
      state.holdings = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Performance report
    builder
      .addCase(fetchPerformanceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.performance = action.payload;
      })
      .addCase(fetchPerformanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Allocation report
    builder
      .addCase(fetchAllocationReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocationReport.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload;
      })
      .addCase(fetchAllocationReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Income report
    builder
      .addCase(fetchIncomeReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomeReport.fulfilled, (state, action) => {
        state.loading = false;
        state.income = action.payload;
      })
      .addCase(fetchIncomeReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Activity report
    builder
      .addCase(fetchActivityReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityReport.fulfilled, (state, action) => {
        state.loading = false;
        state.activity = action.payload;
      })
      .addCase(fetchActivityReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Gain/Loss report
    builder
      .addCase(fetchGainLossReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGainLossReport.fulfilled, (state, action) => {
        state.loading = false;
        state.gainLoss = action.payload;
      })
      .addCase(fetchGainLossReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Holdings report
    builder
      .addCase(fetchHoldingsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHoldingsReport.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings = action.payload;
      })
      .addCase(fetchHoldingsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveReport, setFilters, clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;
