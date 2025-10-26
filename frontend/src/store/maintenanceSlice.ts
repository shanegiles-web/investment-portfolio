import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum MaintenanceCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  HVAC = 'HVAC',
  APPLIANCE = 'APPLIANCE',
  STRUCTURAL = 'STRUCTURAL',
  LANDSCAPING = 'LANDSCAPING',
  PEST_CONTROL = 'PEST_CONTROL',
  CLEANING = 'CLEANING',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  images?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
}

interface MaintenanceState {
  maintenanceRequests: MaintenanceRequest[];
  currentRequest: MaintenanceRequest | null;
  upcomingMaintenance: MaintenanceRequest[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

export const fetchMaintenance = createAsyncThunk(
  'maintenance/fetchMaintenance',
  async (filters?: { status?: MaintenanceStatus; priority?: MaintenancePriority; category?: MaintenanceCategory; propertyId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);

    const response = await api.get(`/maintenance?${params.toString()}`);
    return response.data.maintenanceRequests;
  }
);

export const fetchMaintenanceById = createAsyncThunk(
  'maintenance/fetchMaintenanceById',
  async (requestId: string) => {
    const response = await api.get(`/maintenance/${requestId}`);
    return response.data.maintenanceRequest;
  }
);

export const fetchUpcomingMaintenance = createAsyncThunk(
  'maintenance/fetchUpcomingMaintenance',
  async (days: number = 7) => {
    const response = await api.get(`/maintenance/upcoming?days=${days}`);
    return response.data.maintenanceRequests;
  }
);

export const createMaintenance = createAsyncThunk(
  'maintenance/createMaintenance',
  async (data: {
    propertyId: string;
    title: string;
    description: string;
    category: MaintenanceCategory;
    priority?: MaintenancePriority;
    scheduledDate?: Date;
    assignedTo?: string;
    estimatedCost?: number;
    images?: any;
    notes?: string;
  }) => {
    const response = await api.post('/maintenance', data);
    return response.data.maintenanceRequest;
  }
);

export const updateMaintenance = createAsyncThunk(
  'maintenance/updateMaintenance',
  async ({ requestId, data }: { requestId: string; data: Partial<MaintenanceRequest> }) => {
    const response = await api.put(`/maintenance/${requestId}`, data);
    return response.data.maintenanceRequest;
  }
);

export const scheduleMaintenance = createAsyncThunk(
  'maintenance/scheduleMaintenance',
  async ({ requestId, scheduledDate, assignedTo }: { requestId: string; scheduledDate: Date; assignedTo?: string }) => {
    const response = await api.post(`/maintenance/${requestId}/schedule`, { scheduledDate, assignedTo });
    return response.data.maintenanceRequest;
  }
);

export const startMaintenance = createAsyncThunk(
  'maintenance/startMaintenance',
  async (requestId: string) => {
    const response = await api.post(`/maintenance/${requestId}/start`);
    return response.data.maintenanceRequest;
  }
);

export const completeMaintenance = createAsyncThunk(
  'maintenance/completeMaintenance',
  async ({ requestId, actualCost, notes }: { requestId: string; actualCost: number; notes?: string }) => {
    const response = await api.post(`/maintenance/${requestId}/complete`, { actualCost, notes });
    return response.data.maintenanceRequest;
  }
);

export const cancelMaintenance = createAsyncThunk(
  'maintenance/cancelMaintenance',
  async ({ requestId, reason }: { requestId: string; reason?: string }) => {
    const response = await api.post(`/maintenance/${requestId}/cancel`, { reason });
    return response.data.maintenanceRequest;
  }
);

export const deleteMaintenance = createAsyncThunk(
  'maintenance/deleteMaintenance',
  async (requestId: string) => {
    await api.delete(`/maintenance/${requestId}`);
    return requestId;
  }
);

// ============================================================================
// SLICE
// ============================================================================

const initialState: MaintenanceState = {
  maintenanceRequests: [],
  currentRequest: null,
  upcomingMaintenance: [],
  loading: false,
  error: null,
};

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceRequests = action.payload;
      })
      .addCase(fetchMaintenance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch maintenance requests';
      });

    builder
      .addCase(fetchMaintenanceById.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
      });

    builder
      .addCase(fetchUpcomingMaintenance.fulfilled, (state, action) => {
        state.upcomingMaintenance = action.payload;
      });

    builder
      .addCase(createMaintenance.fulfilled, (state, action) => {
        state.maintenanceRequests.push(action.payload);
        state.currentRequest = action.payload;
      });

    builder
      .addCase(updateMaintenance.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      });

    builder
      .addCase(scheduleMaintenance.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload;
        }
      });

    builder
      .addCase(startMaintenance.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload;
        }
      });

    builder
      .addCase(completeMaintenance.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload;
        }
      });

    builder
      .addCase(cancelMaintenance.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload;
        }
      });

    builder
      .addCase(deleteMaintenance.fulfilled, (state, action) => {
        state.maintenanceRequests = state.maintenanceRequests.filter((r) => r.id !== action.payload);
        if (state.currentRequest?.id === action.payload) {
          state.currentRequest = null;
        }
      });
  },
});

export const { clearCurrentRequest, clearError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
