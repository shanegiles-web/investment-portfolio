import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PortfolioSummary {
  totalProperties: number;
  totalValue: number;
  totalEquity: number;
  totalDebt: number;
  averageCapRate: number;
  averageCashOnCashReturn: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  occupancyRate: number;
  properties: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
    currentValue: number;
    equity: number;
    capRate: number;
    cashOnCashReturn: number;
  }>;
}

export interface PropertyComparison {
  id: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  currentValue: number;
  purchasePrice: number;
  equity: number;
  loanBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  hasActiveTenant: boolean;
  hasActiveLease: boolean;
}

export interface CashFlowProjection {
  propertyId: string;
  address: string;
  projections: Array<{
    month: string;
    income: number;
    expenses: number;
    cashFlow: number;
  }>;
}

export interface OccupancyRate {
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  occupancyRate: number;
}

export interface ROITrends {
  propertyId: string;
  address: string;
  currentROI: number;
  trends: Array<{
    month: string;
    cashOnCashReturn: number;
    monthlyCashFlow: number;
  }>;
}

export interface ExpenseBreakdown {
  year: number;
  totalExpenses: number;
  breakdown: Record<string, number>;
}

export interface MaintenanceCosts {
  totalCost: number;
  completedRequests: number;
  averageCost: number;
  costByCategory: Record<string, number>;
}

interface AnalyticsState {
  portfolioSummary: PortfolioSummary | null;
  propertyComparison: PropertyComparison[];
  cashFlowProjection: CashFlowProjection | null;
  occupancyRate: OccupancyRate | null;
  roiTrends: ROITrends | null;
  expenseBreakdown: ExpenseBreakdown | null;
  maintenanceCosts: MaintenanceCosts | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

export const fetchPortfolioSummary = createAsyncThunk(
  'analytics/fetchPortfolioSummary',
  async () => {
    const response = await api.get('/analytics/portfolio');
    return response.data.summary;
  }
);

export const compareProperties = createAsyncThunk(
  'analytics/compareProperties',
  async (propertyIds: string[]) => {
    const response = await api.post('/analytics/compare', { propertyIds });
    return response.data.comparison;
  }
);

export const fetchCashFlowProjection = createAsyncThunk(
  'analytics/fetchCashFlowProjection',
  async ({ propertyId, months = 12 }: { propertyId: string; months?: number }) => {
    const response = await api.get(`/analytics/cashflow/${propertyId}?months=${months}`);
    return response.data.projection;
  }
);

export const fetchOccupancyRate = createAsyncThunk(
  'analytics/fetchOccupancyRate',
  async () => {
    const response = await api.get('/analytics/occupancy');
    return response.data.occupancy;
  }
);

export const fetchROITrends = createAsyncThunk(
  'analytics/fetchROITrends',
  async ({ propertyId, months = 12 }: { propertyId: string; months?: number }) => {
    const response = await api.get(`/analytics/roi-trends/${propertyId}?months=${months}`);
    return response.data.trends;
  }
);

export const fetchExpenseBreakdown = createAsyncThunk(
  'analytics/fetchExpenseBreakdown',
  async ({ propertyId, year }: { propertyId: string; year?: number }) => {
    const yearParam = year || new Date().getFullYear();
    const response = await api.get(`/analytics/expenses/${propertyId}?year=${yearParam}`);
    return response.data.breakdown;
  }
);

export const fetchMaintenanceCosts = createAsyncThunk(
  'analytics/fetchMaintenanceCosts',
  async ({ propertyId, startDate, endDate }: { propertyId: string; startDate: string; endDate: string }) => {
    const response = await api.get(
      `/analytics/maintenance-costs/${propertyId}?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.costs;
  }
);

// ============================================================================
// SLICE
// ============================================================================

const initialState: AnalyticsState = {
  portfolioSummary: null,
  propertyComparison: [],
  cashFlowProjection: null,
  occupancyRate: null,
  roiTrends: null,
  expenseBreakdown: null,
  maintenanceCosts: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.portfolioSummary = null;
      state.propertyComparison = [];
      state.cashFlowProjection = null;
      state.occupancyRate = null;
      state.roiTrends = null;
      state.expenseBreakdown = null;
      state.maintenanceCosts = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolioSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioSummary.fulfilled, (state, action: PayloadAction<PortfolioSummary>) => {
        state.loading = false;
        state.portfolioSummary = action.payload;
      })
      .addCase(fetchPortfolioSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolio summary';
      });

    builder
      .addCase(compareProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compareProperties.fulfilled, (state, action: PayloadAction<PropertyComparison[]>) => {
        state.loading = false;
        state.propertyComparison = action.payload;
      })
      .addCase(compareProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to compare properties';
      });

    builder
      .addCase(fetchCashFlowProjection.fulfilled, (state, action: PayloadAction<CashFlowProjection>) => {
        state.cashFlowProjection = action.payload;
      });

    builder
      .addCase(fetchOccupancyRate.fulfilled, (state, action: PayloadAction<OccupancyRate>) => {
        state.occupancyRate = action.payload;
      });

    builder
      .addCase(fetchROITrends.fulfilled, (state, action: PayloadAction<ROITrends>) => {
        state.roiTrends = action.payload;
      });

    builder
      .addCase(fetchExpenseBreakdown.fulfilled, (state, action: PayloadAction<ExpenseBreakdown>) => {
        state.expenseBreakdown = action.payload;
      });

    builder
      .addCase(fetchMaintenanceCosts.fulfilled, (state, action: PayloadAction<MaintenanceCosts>) => {
        state.maintenanceCosts = action.payload;
      });
  },
});

export const { clearAnalytics, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
