import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum LeaseStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  PENDING = 'PENDING',
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId?: string;
  tenantName: string;
  tenantContact?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  depositHeld: number;
  leaseTermMonths?: number;
  renewalOption: boolean;
  autoRenewal: boolean;
  status: LeaseStatus;
  isActive: boolean;
  leaseDocumentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
  tenant?: any;
}

interface LeasesState {
  leases: Lease[];
  currentLease: Lease | null;
  expiringLeases: Lease[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch all leases
 */
export const fetchLeases = createAsyncThunk(
  'leases/fetchLeases',
  async (filters?: { status?: LeaseStatus; isActive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const response = await api.get(`/leases?${params.toString()}`);
    return response.data.leases;
  }
);

/**
 * Fetch lease by ID
 */
export const fetchLeaseById = createAsyncThunk(
  'leases/fetchLeaseById',
  async (leaseId: string) => {
    const response = await api.get(`/leases/${leaseId}`);
    return response.data.lease;
  }
);

/**
 * Fetch expiring leases
 */
export const fetchExpiringLeases = createAsyncThunk(
  'leases/fetchExpiringLeases',
  async (days: number = 30) => {
    const response = await api.get(`/leases/expiring?days=${days}`);
    return response.data.leases;
  }
);

/**
 * Fetch lease calendar
 */
export const fetchLeaseCalendar = createAsyncThunk(
  'leases/fetchLeaseCalendar',
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await api.get(`/leases/calendar?startDate=${startDate}&endDate=${endDate}`);
    return response.data.leases;
  }
);

/**
 * Create a new lease
 */
export const createLease = createAsyncThunk(
  'leases/createLease',
  async (data: {
    propertyId: string;
    tenantId?: string;
    tenantName: string;
    tenantContact?: string;
    startDate: Date;
    endDate: Date;
    monthlyRent: number;
    securityDeposit?: number;
    depositHeld?: number;
    leaseTermMonths?: number;
    renewalOption?: boolean;
    autoRenewal?: boolean;
    leaseDocumentUrl?: string;
    notes?: string;
  }) => {
    const response = await api.post('/leases', data);
    return response.data.lease;
  }
);

/**
 * Update lease
 */
export const updateLease = createAsyncThunk(
  'leases/updateLease',
  async ({ leaseId, data }: { leaseId: string; data: Partial<Lease> }) => {
    const response = await api.put(`/leases/${leaseId}`, data);
    return response.data.lease;
  }
);

/**
 * Terminate lease
 */
export const terminateLease = createAsyncThunk(
  'leases/terminateLease',
  async ({ leaseId, terminationDate }: { leaseId: string; terminationDate: Date }) => {
    const response = await api.post(`/leases/${leaseId}/terminate`, { terminationDate });
    return response.data.lease;
  }
);

/**
 * Renew lease
 */
export const renewLease = createAsyncThunk(
  'leases/renewLease',
  async ({ leaseId, newEndDate, newMonthlyRent }: { leaseId: string; newEndDate: Date; newMonthlyRent?: number }) => {
    const response = await api.post(`/leases/${leaseId}/renew`, { newEndDate, newMonthlyRent });
    return response.data.lease;
  }
);

/**
 * Delete lease
 */
export const deleteLease = createAsyncThunk(
  'leases/deleteLease',
  async (leaseId: string) => {
    await api.delete(`/leases/${leaseId}`);
    return leaseId;
  }
);

// ============================================================================
// SLICE
// ============================================================================

const initialState: LeasesState = {
  leases: [],
  currentLease: null,
  expiringLeases: [],
  loading: false,
  error: null,
};

const leasesSlice = createSlice({
  name: 'leases',
  initialState,
  reducers: {
    clearCurrentLease: (state) => {
      state.currentLease = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all leases
    builder
      .addCase(fetchLeases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeases.fulfilled, (state, action: PayloadAction<Lease[]>) => {
        state.loading = false;
        state.leases = action.payload;
      })
      .addCase(fetchLeases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leases';
      });

    // Fetch lease by ID
    builder
      .addCase(fetchLeaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaseById.fulfilled, (state, action: PayloadAction<Lease>) => {
        state.loading = false;
        state.currentLease = action.payload;
      })
      .addCase(fetchLeaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lease';
      });

    // Fetch expiring leases
    builder
      .addCase(fetchExpiringLeases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpiringLeases.fulfilled, (state, action: PayloadAction<Lease[]>) => {
        state.loading = false;
        state.expiringLeases = action.payload;
      })
      .addCase(fetchExpiringLeases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch expiring leases';
      });

    // Fetch lease calendar
    builder
      .addCase(fetchLeaseCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaseCalendar.fulfilled, (state, action: PayloadAction<Lease[]>) => {
        state.loading = false;
        state.leases = action.payload;
      })
      .addCase(fetchLeaseCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lease calendar';
      });

    // Create lease
    builder
      .addCase(createLease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLease.fulfilled, (state, action: PayloadAction<Lease>) => {
        state.loading = false;
        state.leases.push(action.payload);
        state.currentLease = action.payload;
      })
      .addCase(createLease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create lease';
      });

    // Update lease
    builder
      .addCase(updateLease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLease.fulfilled, (state, action: PayloadAction<Lease>) => {
        state.loading = false;
        const index = state.leases.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.leases[index] = action.payload;
        }
        if (state.currentLease?.id === action.payload.id) {
          state.currentLease = action.payload;
        }
      })
      .addCase(updateLease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update lease';
      });

    // Terminate lease
    builder
      .addCase(terminateLease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(terminateLease.fulfilled, (state, action: PayloadAction<Lease>) => {
        state.loading = false;
        const index = state.leases.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.leases[index] = action.payload;
        }
        if (state.currentLease?.id === action.payload.id) {
          state.currentLease = action.payload;
        }
      })
      .addCase(terminateLease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to terminate lease';
      });

    // Renew lease
    builder
      .addCase(renewLease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renewLease.fulfilled, (state, action: PayloadAction<Lease>) => {
        state.loading = false;
        state.leases.push(action.payload);
        state.currentLease = action.payload;
      })
      .addCase(renewLease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to renew lease';
      });

    // Delete lease
    builder
      .addCase(deleteLease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLease.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.leases = state.leases.filter((l) => l.id !== action.payload);
        if (state.currentLease?.id === action.payload) {
          state.currentLease = null;
        }
      })
      .addCase(deleteLease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete lease';
      });
  },
});

export const { clearCurrentLease, clearError } = leasesSlice.actions;
export default leasesSlice.reducer;
