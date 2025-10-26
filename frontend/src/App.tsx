import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { theme } from './theme';
import { store } from './store';
import { MainLayout } from './layouts';
import { Dashboard, Accounts, Positions, Transactions, Reports, Settings, Login, Register } from './pages';
import { ProtectedRoute } from './components';
import { PropertiesList, PropertyDetails } from './components/properties';
import { TenantsList } from './components/tenants/TenantsList';
import { LeasesList } from './components/leases/LeasesList';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="positions" element={<Positions />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="properties" element={<PropertiesList />} />
              <Route path="properties/:id" element={<PropertyDetails />} />
              {/* Tenants and Leases are now accessed via Property Details tabs */}
              {/* Keeping routes for backward compatibility */}
              <Route path="tenants" element={<Navigate to="/properties" replace />} />
              <Route path="leases" element={<Navigate to="/properties" replace />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
