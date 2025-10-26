import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum PropertyType {
  SINGLE_FAMILY = 'SINGLE_FAMILY',
  MULTI_FAMILY = 'MULTI_FAMILY',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
  APARTMENT_COMPLEX = 'APARTMENT_COMPLEX',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  MOBILE_HOME = 'MOBILE_HOME',
}

export enum PropertyIncomeType {
  RENT = 'RENT',
  LAUNDRY = 'LAUNDRY',
  VENDING = 'VENDING',
  PARKING = 'PARKING',
  PET_FEE = 'PET_FEE',
  LATE_FEE = 'LATE_FEE',
  APPLICATION_FEE = 'APPLICATION_FEE',
  OTHER = 'OTHER',
}

export enum IncomeFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  ONE_TIME = 'ONE_TIME',
}

export interface Property {
  id: string;
  userId: string;
  accountId?: string;
  entityId?: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string;
  zip: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  loanBalance: number;

  // Financial details
  refurbishCosts?: number;
  furnishCosts?: number;
  acquisitionCosts?: number;
  downPayment?: number;
  loanAmount?: number;
  loanInterestRate?: number;
  loanTermYears?: number;
  monthlyMortgagePayment?: number;
  propertyManagementFeePercent?: number;
  vacancyRatePercent?: number;
  desiredCapRate?: number;

  // Property images
  primaryImageUrl?: string;
  imageUrls?: string[];

  // Physical details
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  numberOfUnits?: number;

  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;

  // Optional: Include account info when fetched
  account?: {
    accountName: string;
    taxTreatment: string;
  };
}

export interface PropertyExpenseTemplate {
  id: string;
  propertyId: string;

  // Management & Professional Services
  propertyManagementFee?: number;
  accountingLegalFees?: number;

  // Property Maintenance
  repairsMaintenance?: number;
  pestControl?: number;

  // Taxes & Insurance
  realEstateTaxes?: number;
  propertyInsurance?: number;
  hoaFees?: number;

  // Utilities (if landlord pays)
  waterSewer?: number;
  gasElectricity?: number;
  garbage?: number;
  cablePhoneInternet?: number;

  // Marketing
  advertising?: number;

  // Other
  otherExpenses?: Record<string, number>;

  createdAt: string;
  updatedAt: string;
}

export interface PropertyIncome {
  id: string;
  propertyId: string;
  incomeType: PropertyIncomeType;
  amount: number;
  frequency: IncomeFrequency;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFinancials {
  propertyId: string;

  // Income calculations
  grossMonthlyRentalIncome: number;
  additionalMonthlyIncome: number;
  totalGrossMonthlyIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;

  // Expense calculations
  totalMonthlyExpenses: number;

  // NOI & Cash Flow
  monthlyNOI: number;
  annualNOI: number;
  monthlyCashFlow: number;
  annualCashFlow: number;

  // Investment Metrics
  capRate: number;
  cashOnCashReturn: number;
  returnOnEquity: number;

  // Loan Metrics
  loanToValue: number;
  debtServiceCoverageRatio: number;

  // Rules of Thumb
  meetsOnePercentRule: boolean;
  meetsTwoPercentRule: boolean;
  meetsOneThirtyFiveRule: boolean;

  // Total Investment
  totalInvestment: number;
  totalCashInvested: number;
}

// ============================================================================
// STATE DEFINITION
// ============================================================================

interface PropertiesState {
  properties: Property[];
  currentProperty: Property | null;
  financials: PropertyFinancials | null;
  expenses: PropertyExpenseTemplate | null;
  income: PropertyIncome[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertiesState = {
  properties: [],
  currentProperty: null,
  financials: null,
  expenses: null,
  income: [],
  loading: false,
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Properties
export const fetchProperties = createAsyncThunk('properties/fetchAll', async () => {
  const response = await api.get<{ properties: Property[] }>('/properties');
  return response.properties;
});

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (propertyId: string) => {
    const response = await api.get<{ property: Property }>(`/properties/${propertyId}`);
    return response.property;
  }
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async (propertyData: Partial<Property>) => {
    const response = await api.post<{ property: Property }>('/properties', propertyData);
    return response.property;
  }
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, data }: { id: string; data: Partial<Property> }) => {
    const response = await api.put<{ property: Property }>(`/properties/${id}`, data);
    return response.property;
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (propertyId: string) => {
    await api.delete(`/properties/${propertyId}`);
    return propertyId;
  }
);

// Images
export const uploadPropertyImages = createAsyncThunk(
  'properties/uploadImages',
  async ({ propertyId, files }: { propertyId: string; files: File[] }) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<{
      property: Property;
      uploadedUrls: string[]
    }>(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  }
);

export const deletePropertyImage = createAsyncThunk(
  'properties/deleteImage',
  async ({ propertyId, imageUrl }: { propertyId: string; imageUrl: string }) => {
    const response = await api.delete<{ property: Property }>(
      `/properties/${propertyId}/images`,
      { data: { imageUrl } }
    );
    return response.property;
  }
);

export const setPrimaryImage = createAsyncThunk(
  'properties/setPrimaryImage',
  async ({ propertyId, imageUrl }: { propertyId: string; imageUrl: string }) => {
    const response = await api.put<{ property: Property }>(
      `/properties/${propertyId}/images/primary`,
      { imageUrl }
    );
    return response.property;
  }
);

// Financials
export const fetchPropertyFinancials = createAsyncThunk(
  'properties/fetchFinancials',
  async (propertyId: string) => {
    const response = await api.get<{ financials: PropertyFinancials }>(
      `/properties/${propertyId}/financials`
    );
    return response.financials;
  }
);

// Expenses
export const fetchPropertyExpenses = createAsyncThunk(
  'properties/fetchExpenses',
  async (propertyId: string) => {
    const response = await api.get<{ expenses: PropertyExpenseTemplate }>(
      `/properties/${propertyId}/expenses`
    );
    return response.expenses;
  }
);

export const updatePropertyExpenses = createAsyncThunk(
  'properties/updateExpenses',
  async ({ propertyId, data }: { propertyId: string; data: Partial<PropertyExpenseTemplate> }) => {
    const response = await api.put<{ expenses: PropertyExpenseTemplate }>(
      `/properties/${propertyId}/expenses`,
      data
    );
    return response.expenses;
  }
);

// Income
export const fetchPropertyIncome = createAsyncThunk(
  'properties/fetchIncome',
  async (propertyId: string) => {
    const response = await api.get<{ income: PropertyIncome[] }>(
      `/properties/${propertyId}/income`
    );
    return response.income;
  }
);

export const addPropertyIncome = createAsyncThunk(
  'properties/addIncome',
  async ({ propertyId, data }: { propertyId: string; data: Partial<PropertyIncome> }) => {
    const response = await api.post<{ income: PropertyIncome }>(
      `/properties/${propertyId}/income`,
      data
    );
    return response.income;
  }
);

export const updatePropertyIncome = createAsyncThunk(
  'properties/updateIncome',
  async ({
    propertyId,
    incomeId,
    data
  }: {
    propertyId: string;
    incomeId: string;
    data: Partial<PropertyIncome>
  }) => {
    const response = await api.put<{ income: PropertyIncome }>(
      `/properties/${propertyId}/income/${incomeId}`,
      data
    );
    return response.income;
  }
);

export const deletePropertyIncome = createAsyncThunk(
  'properties/deleteIncome',
  async ({ propertyId, incomeId }: { propertyId: string; incomeId: string }) => {
    await api.delete(`/properties/${propertyId}/income/${incomeId}`);
    return incomeId;
  }
);

// ============================================================================
// SLICE
// ============================================================================

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setCurrentProperty: (state, action: PayloadAction<Property | null>) => {
      state.currentProperty = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFinancials: (state) => {
      state.financials = null;
    },
    clearExpenses: (state) => {
      state.expenses = null;
    },
    clearIncome: (state) => {
      state.income = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all properties
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch properties';
      });

    // Fetch property by ID
    builder
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch property';
      });

    // Create property
    builder
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties.unshift(action.payload);
        state.currentProperty = action.payload;
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create property';
      });

    // Update property
    builder
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.properties.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
        if (state.currentProperty?.id === action.payload.id) {
          state.currentProperty = action.payload;
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update property';
      });

    // Delete property
    builder
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = state.properties.filter((p) => p.id !== action.payload);
        if (state.currentProperty?.id === action.payload) {
          state.currentProperty = null;
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete property';
      });

    // Upload images
    builder
      .addCase(uploadPropertyImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPropertyImages.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProperty = action.payload.property;
        const index = state.properties.findIndex((p) => p.id === updatedProperty.id);
        if (index !== -1) {
          state.properties[index] = updatedProperty;
        }
        if (state.currentProperty?.id === updatedProperty.id) {
          state.currentProperty = updatedProperty;
        }
      })
      .addCase(uploadPropertyImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload images';
      });

    // Delete image
    builder
      .addCase(deletePropertyImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePropertyImage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.properties.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
        if (state.currentProperty?.id === action.payload.id) {
          state.currentProperty = action.payload;
        }
      })
      .addCase(deletePropertyImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete image';
      });

    // Set primary image
    builder
      .addCase(setPrimaryImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setPrimaryImage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.properties.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
        if (state.currentProperty?.id === action.payload.id) {
          state.currentProperty = action.payload;
        }
      })
      .addCase(setPrimaryImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to set primary image';
      });

    // Fetch financials
    builder
      .addCase(fetchPropertyFinancials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyFinancials.fulfilled, (state, action) => {
        state.loading = false;
        state.financials = action.payload;
      })
      .addCase(fetchPropertyFinancials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch financials';
      });

    // Fetch expenses
    builder
      .addCase(fetchPropertyExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchPropertyExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch expenses';
      });

    // Update expenses
    builder
      .addCase(updatePropertyExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePropertyExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(updatePropertyExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update expenses';
      });

    // Fetch income
    builder
      .addCase(fetchPropertyIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.income = action.payload;
      })
      .addCase(fetchPropertyIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch income';
      });

    // Add income
    builder
      .addCase(addPropertyIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPropertyIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.income.push(action.payload);
      })
      .addCase(addPropertyIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add income';
      });

    // Update income
    builder
      .addCase(updatePropertyIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePropertyIncome.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.income.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.income[index] = action.payload;
        }
      })
      .addCase(updatePropertyIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update income';
      });

    // Delete income
    builder
      .addCase(deletePropertyIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePropertyIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.income = state.income.filter((i) => i.id !== action.payload);
      })
      .addCase(deletePropertyIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete income';
      });
  },
});

export const {
  setCurrentProperty,
  clearError,
  clearFinancials,
  clearExpenses,
  clearIncome,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;
