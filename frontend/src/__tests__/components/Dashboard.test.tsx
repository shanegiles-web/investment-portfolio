import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { store } from '../../store';
import { theme } from '../../theme';
import { Dashboard } from '../../pages/Dashboard';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>{component}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('Dashboard Component', () => {
  it('renders dashboard heading', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    renderWithProviders(<Dashboard />);
    expect(
      screen.getByText('Welcome to your Investment Portfolio Management System')
    ).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText('Total Net Worth')).toBeInTheDocument();
    expect(screen.getByText('Total Accounts')).toBeInTheDocument();
    expect(screen.getByText('Total Positions')).toBeInTheDocument();
    expect(screen.getByText('Backend Status')).toBeInTheDocument();
  });

  it('displays placeholder values', () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('0', { selector: 'h5' })).toBeInTheDocument();
  });
});
