import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

export interface Position {
  id: string;
  accountId: string;
  investmentTypeId: string;
  symbol?: string;
  name: string;
  shares: number;
  costBasisTotal: number;
  costBasisPerShare: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  lastUpdated: string;
  account?: {
    id: string;
    accountName: string;
    accountType: string;
  };
  investmentType?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface InvestmentType {
  id: string;
  name: string;
  category: string;
}

interface PositionsState {
  positions: Position[];
  investmentTypes: InvestmentType[];
  loading: boolean;
  error: string | null;
  selectedPosition: Position | null;
}

const initialState: PositionsState = {
  positions: [],
  investmentTypes: [],
  loading: false,
  error: null,
  selectedPosition: null,
};

// Async thunks
export const fetchPositions = createAsyncThunk('positions/fetchPositions', async () => {
  const response = await api.get<{ positions: Position[] }>('/positions');
  return response.positions;
});

export const fetchInvestmentTypes = createAsyncThunk('positions/fetchInvestmentTypes', async () => {
  const response = await api.get<{ investmentTypes: InvestmentType[] }>('/investment-types');
  return response.investmentTypes;
});

export const createPosition = createAsyncThunk(
  'positions/createPosition',
  async (positionData: Partial<Position>) => {
    const response = await api.post<{ position: Position }>('/positions', positionData);
    return response.position;
  }
);

export const updatePosition = createAsyncThunk(
  'positions/updatePosition',
  async ({ id, data }: { id: string; data: Partial<Position> }) => {
    const response = await api.put<{ position: Position }>(`/positions/${id}`, data);
    return response.position;
  }
);

export const deletePosition = createAsyncThunk(
  'positions/deletePosition',
  async (positionId: string) => {
    await api.delete(`/positions/${positionId}`);
    return positionId;
  }
);

const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    setSelectedPosition: (state, action: PayloadAction<Position | null>) => {
      state.selectedPosition = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch positions
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch positions';
      });

    // Fetch investment types
    builder
      .addCase(fetchInvestmentTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvestmentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.investmentTypes = action.payload;
      })
      .addCase(fetchInvestmentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investment types';
      });

    // Create position
    builder
      .addCase(createPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        state.loading = false;
        state.positions.unshift(action.payload);
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create position';
      });

    // Update position
    builder
      .addCase(updatePosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.positions.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.positions[index] = action.payload;
        }
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update position';
      });

    // Delete position
    builder
      .addCase(deletePosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = state.positions.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete position';
      });
  },
});

export const { setSelectedPosition, clearError } = positionsSlice.actions;
export default positionsSlice.reducer;
