import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Tenant {
  id: string;
  propertyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  moveInDate: string;
  moveOutDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
  leases?: any[];
}

interface TenantsState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch all tenants
 */
export const fetchTenants = createAsyncThunk(
  'tenants/fetchTenants',
  async (filters?: { isActive?: boolean; propertyId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);

    const response = await api.get<{ tenants: Tenant[] }>(`/tenants?${params.toString()}`);
    return response.tenants;
  }
);

/**
 * Fetch tenant by ID
 */
export const fetchTenantById = createAsyncThunk(
  'tenants/fetchTenantById',
  async (tenantId: string) => {
    const response = await api.get<{ tenant: Tenant }>(`/tenants/${tenantId}`);
    return response.tenant;
  }
);

/**
 * Create a new tenant
 */
export const createTenant = createAsyncThunk(
  'tenants/createTenant',
  async (data: {
    propertyId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    moveInDate: Date;
    notes?: string;
  }) => {
    console.log('🔵 [tenantsSlice] createTenant thunk called');
    console.log('📤 Request data:', data);

    try {
      console.log('⏳ [tenantsSlice] Sending POST request to /tenants...');
      const response = await api.post<{ tenant: Tenant }>('/tenants', data);
      console.log('📥 [tenantsSlice] Response received:', response);
      console.log('✅ [tenantsSlice] Tenant data:', response.tenant);
      return response.tenant;
    } catch (error: any) {
      console.error('❌ [tenantsSlice] API error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  }
);

/**
 * Update tenant
 */
export const updateTenant = createAsyncThunk(
  'tenants/updateTenant',
  async ({ tenantId, data }: { tenantId: string; data: Partial<Tenant> }) => {
    const response = await api.put<{ tenant: Tenant }>(`/tenants/${tenantId}`, data);
    return response.tenant;
  }
);

/**
 * Mark tenant as moved out
 */
export const markTenantMovedOut = createAsyncThunk(
  'tenants/markTenantMovedOut',
  async ({ tenantId, moveOutDate }: { tenantId: string; moveOutDate: Date }) => {
    const response = await api.post<{ tenant: Tenant }>(`/tenants/${tenantId}/move-out`, { moveOutDate });
    return response.tenant;
  }
);

/**
 * Delete tenant
 */
export const deleteTenant = createAsyncThunk(
  'tenants/deleteTenant',
  async (tenantId: string) => {
    await api.delete(`/tenants/${tenantId}`);
    return tenantId;
  }
);

/**
 * Search tenants
 */
export const searchTenants = createAsyncThunk(
  'tenants/searchTenants',
  async (searchTerm: string) => {
    const response = await api.get<{ tenants: Tenant[] }>(`/tenants/search?q=${encodeURIComponent(searchTerm)}`);
    return response.tenants;
  }
);

// ============================================================================
// SLICE
// ============================================================================

const initialState: TenantsState = {
  tenants: [],
  currentTenant: null,
  loading: false,
  error: null,
};

const tenantsSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    clearCurrentTenant: (state) => {
      state.currentTenant = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all tenants
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action: PayloadAction<Tenant[]>) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tenants';
      });

    // Fetch tenant by ID
    builder
      .addCase(fetchTenantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantById.fulfilled, (state, action: PayloadAction<Tenant>) => {
        state.loading = false;
        state.currentTenant = action.payload;
      })
      .addCase(fetchTenantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tenant';
      });

    // Create tenant
    builder
      .addCase(createTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTenant.fulfilled, (state, action: PayloadAction<Tenant>) => {
        state.loading = false;
        state.tenants.push(action.payload);
        state.currentTenant = action.payload;
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tenant';
      });

    // Update tenant
    builder
      .addCase(updateTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action: PayloadAction<Tenant>) => {
        state.loading = false;
        const index = state.tenants.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
        if (state.currentTenant?.id === action.payload.id) {
          state.currentTenant = action.payload;
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update tenant';
      });

    // Mark tenant moved out
    builder
      .addCase(markTenantMovedOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markTenantMovedOut.fulfilled, (state, action: PayloadAction<Tenant>) => {
        state.loading = false;
        const index = state.tenants.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
        if (state.currentTenant?.id === action.payload.id) {
          state.currentTenant = action.payload;
        }
      })
      .addCase(markTenantMovedOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark tenant as moved out';
      });

    // Delete tenant
    builder
      .addCase(deleteTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.tenants = state.tenants.filter((t) => t.id !== action.payload);
        if (state.currentTenant?.id === action.payload) {
          state.currentTenant = null;
        }
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete tenant';
      });

    // Search tenants
    builder
      .addCase(searchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTenants.fulfilled, (state, action: PayloadAction<Tenant[]>) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(searchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search tenants';
      });
  },
});

export const { clearCurrentTenant, clearError } = tenantsSlice.actions;
export default tenantsSlice.reducer;
