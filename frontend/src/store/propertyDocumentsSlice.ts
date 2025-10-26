import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum PropertyDocumentType {
  DEED = 'DEED',
  TITLE = 'TITLE',
  MORTGAGE = 'MORTGAGE',
  INSURANCE = 'INSURANCE',
  TAX_RECORD = 'TAX_RECORD',
  INSPECTION_REPORT = 'INSPECTION_REPORT',
  APPRAISAL = 'APPRAISAL',
  LEASE_AGREEMENT = 'LEASE_AGREEMENT',
  REPAIR_RECEIPT = 'REPAIR_RECEIPT',
  UTILITY_BILL = 'UTILITY_BILL',
  HOA_DOCUMENT = 'HOA_DOCUMENT',
  WARRANTY = 'WARRANTY',
  PERMIT = 'PERMIT',
  OTHER = 'OTHER',
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  documentType: PropertyDocumentType;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  tags?: any;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
}

interface PropertyDocumentsState {
  documents: PropertyDocument[];
  currentDocument: PropertyDocument | null;
  expiringDocuments: PropertyDocument[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

export const fetchPropertyDocuments = createAsyncThunk(
  'propertyDocuments/fetchPropertyDocuments',
  async (propertyId: string) => {
    const response = await api.get(`/property-documents?propertyId=${propertyId}`);
    return response.data.documents;
  }
);

export const fetchPropertyDocumentById = createAsyncThunk(
  'propertyDocuments/fetchPropertyDocumentById',
  async (documentId: string) => {
    const response = await api.get(`/property-documents/${documentId}`);
    return response.data.document;
  }
);

export const fetchExpiringDocuments = createAsyncThunk(
  'propertyDocuments/fetchExpiringDocuments',
  async (days: number = 30) => {
    const response = await api.get(`/property-documents/expiring?days=${days}`);
    return response.data.documents;
  }
);

export const createPropertyDocument = createAsyncThunk(
  'propertyDocuments/createPropertyDocument',
  async (data: {
    propertyId: string;
    documentType: PropertyDocumentType;
    title: string;
    description?: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy?: string;
    tags?: any;
    expiryDate?: Date;
  }) => {
    const response = await api.post('/property-documents', data);
    return response.data.document;
  }
);

export const updatePropertyDocument = createAsyncThunk(
  'propertyDocuments/updatePropertyDocument',
  async ({ documentId, data }: { documentId: string; data: Partial<PropertyDocument> }) => {
    const response = await api.put(`/property-documents/${documentId}`, data);
    return response.data.document;
  }
);

export const deletePropertyDocument = createAsyncThunk(
  'propertyDocuments/deletePropertyDocument',
  async (documentId: string) => {
    await api.delete(`/property-documents/${documentId}`);
    return documentId;
  }
);

// ============================================================================
// SLICE
// ============================================================================

const initialState: PropertyDocumentsState = {
  documents: [],
  currentDocument: null,
  expiringDocuments: [],
  loading: false,
  error: null,
};

const propertyDocumentsSlice = createSlice({
  name: 'propertyDocuments',
  initialState,
  reducers: {
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyDocuments.fulfilled, (state, action: PayloadAction<PropertyDocument[]>) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchPropertyDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch property documents';
      });

    builder
      .addCase(fetchPropertyDocumentById.fulfilled, (state, action: PayloadAction<PropertyDocument>) => {
        state.currentDocument = action.payload;
      });

    builder
      .addCase(fetchExpiringDocuments.fulfilled, (state, action: PayloadAction<PropertyDocument[]>) => {
        state.expiringDocuments = action.payload;
      });

    builder
      .addCase(createPropertyDocument.fulfilled, (state, action: PayloadAction<PropertyDocument>) => {
        state.documents.push(action.payload);
        state.currentDocument = action.payload;
      });

    builder
      .addCase(updatePropertyDocument.fulfilled, (state, action: PayloadAction<PropertyDocument>) => {
        const index = state.documents.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      });

    builder
      .addCase(deletePropertyDocument.fulfilled, (state, action: PayloadAction<string>) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
      });
  },
});

export const { clearCurrentDocument, clearError } = propertyDocumentsSlice.actions;
export default propertyDocumentsSlice.reducer;
