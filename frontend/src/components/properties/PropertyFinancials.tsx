import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccountBalance as BankIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import type { Property } from '../../store/propertiesSlice';
import { fetchPropertyFinancials } from '../../store/propertiesSlice';

interface PropertyFinancialsProps {
  property: Property;
}

export const PropertyFinancials: React.FC<PropertyFinancialsProps> = ({ property }) => {
  const dispatch = useAppDispatch();
  const { financials, loading, error } = useAppSelector((state) => state.properties);

  useEffect(() => {
    dispatch(fetchPropertyFinancials(property.id));
  }, [dispatch, property.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!financials) {
    return (
      <Alert severity="info">
        No financial data available. Please add income and expense information.
      </Alert>
    );
  }

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color = 'primary',
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{ color: `${color}.main`, opacity: 0.7 }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const RuleIndicator = ({ label, met }: { label: string; met: boolean }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {met ? (
        <CheckIcon color="success" fontSize="small" />
      ) : (
        <CancelIcon color="error" fontSize="small" />
      )}
      <Typography variant="body2" color={met ? 'success.main' : 'error.main'}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box>
      {/* Key Metrics */}
      <Typography variant="h6" gutterBottom>
        Key Performance Metrics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cap Rate"
            value={formatPercent(financials.capRate)}
            subtitle="Annual NOI / Purchase Price"
            icon={<TrendingUpIcon />}
            color={financials.capRate >= (property.desiredCapRate || 8) ? 'success' : 'warning'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cash-on-Cash Return"
            value={formatPercent(financials.cashOnCashReturn)}
            subtitle="Annual Cash Flow / Cash Invested"
            icon={<MoneyIcon />}
            color={financials.cashOnCashReturn >= 8 ? 'success' : 'warning'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Cash Flow"
            value={formatCurrency(financials.monthlyCashFlow)}
            subtitle="After all expenses"
            icon={financials.monthlyCashFlow >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            color={financials.monthlyCashFlow >= 0 ? 'success' : 'error'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Annual NOI"
            value={formatCurrency(financials.annualNOI)}
            subtitle="Net Operating Income"
            icon={<BankIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Income & Expenses Breakdown */}
      <Typography variant="h6" gutterBottom>
        Income & Expenses
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Monthly Income
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Rental Income</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(financials.grossMonthlyRentalIncome)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Additional Income</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(financials.additionalMonthlyIncome)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2" color="error.main">
                Vacancy Loss ({property.vacancyRatePercent || 0}%)
              </Typography>
              <Typography variant="body2" fontWeight="medium" color="error.main">
                -{formatCurrency(financials.vacancyLoss)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" fontWeight="bold">
                Effective Gross Income
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                {formatCurrency(financials.effectiveGrossIncome)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Monthly Expenses
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Operating Expenses</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(financials.totalMonthlyExpenses)}
              </Typography>
            </Box>

            {financials.monthlyMortgagePayment && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography variant="body2">Mortgage Payment</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(property.monthlyMortgagePayment || 0)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" fontWeight="bold">
                Monthly NOI
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                {formatCurrency(financials.monthlyNOI)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Investment Metrics */}
      <Typography variant="h6" gutterBottom>
        Investment Analysis
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Total Investment
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Total Investment</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(financials.totalInvestment)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Total Cash Invested</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(financials.totalCashInvested)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Return on Equity</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatPercent(financials.returnOnEquity)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Loan Metrics
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Loan to Value (LTV)</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatPercent(financials.loanToValue)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
              <Typography variant="body2">Debt Service Coverage Ratio</Typography>
              <Typography variant="body2" fontWeight="medium">
                {financials.debtServiceCoverageRatio.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Rules of Thumb */}
      <Typography variant="h6" gutterBottom>
        Rules of Thumb
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <RuleIndicator label="1% Rule" met={financials.meetsOnePercentRule} />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Monthly rent ≥ 1% of purchase price
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <RuleIndicator label="2% Rule" met={financials.meetsTwoPercentRule} />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Monthly rent ≥ 2% of purchase price
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <RuleIndicator label="1.35 Rule" met={financials.meetsOneThirtyFiveRule} />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Monthly rent ≥ 1.35x monthly expenses
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
