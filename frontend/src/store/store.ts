import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import accountsReducer from './accountsSlice';
import positionsReducer from './positionsSlice';
import transactionsReducer from './transactionsSlice';
import dashboardReducer from './dashboardSlice';
import reportsReducer from './reportsSlice';
import propertiesReducer from './propertiesSlice';
import tenantsReducer from './tenantsSlice';
import leasesReducer from './leasesSlice';
import maintenanceReducer from './maintenanceSlice';
import propertyDocumentsReducer from './propertyDocumentsSlice';
import analyticsReducer from './analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    positions: positionsReducer,
    transactions: transactionsReducer,
    dashboard: dashboardReducer,
    reports: reportsReducer,
    properties: propertiesReducer,
    tenants: tenantsReducer,
    leases: leasesReducer,
    maintenance: maintenanceReducer,
    propertyDocuments: propertyDocumentsReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
