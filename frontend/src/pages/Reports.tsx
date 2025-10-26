import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setActiveReport, setFilters } from '../store/reportsSlice';
import { fetchAccounts } from '../store/accountsSlice';
import { ExportDialog, type ReportType } from '../components/reports/ExportDialog';
import { FeedbackButton } from '../components/common/FeedbackButton';

// Lazy load report components
const PerformanceReport = lazy(() => import('../components/reports/PerformanceReport'));
const AllocationReport = lazy(() => import('../components/reports/AllocationReport'));
const IncomeReport = lazy(() => import('../components/reports/IncomeReport'));
const ActivityReport = lazy(() => import('../components/reports/ActivityReport'));
const GainLossReport = lazy(() => import('../components/reports/GainLossReport'));
const HoldingsReport = lazy(() => import('../components/reports/HoldingsReport'));

export const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeReport, filters, loading, error } = useAppSelector((state) => state.reports);
  const { accounts } = useAppSelector((state) => state.accounts);

  const [accountFilter, setAccountFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    // Load accounts for filter dropdown
    dispatch(fetchAccounts());

    // Auto-load report with "All Accounts" on initial page load
    const initialFilters = {
      accountId: undefined,
      startDate: undefined,
      endDate: new Date().toISOString().split('T')[0],
    };
    dispatch(setFilters(initialFilters));
  }, [dispatch]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    dispatch(
      setActiveReport(newValue as 'performance' | 'allocation' | 'income' | 'activity' | 'gainLoss' | 'holdings')
    );
  };

  const handleApplyFilters = () => {
    const newFilters = {
      accountId: accountFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    dispatch(setFilters(newFilters));
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  // Map activeReport to ReportType
  const getReportType = (): ReportType => {
    const reportTypeMap: Record<string, ReportType> = {
      performance: 'performance',
      allocation: 'allocation',
      income: 'income',
      activity: 'activity',
      gainLoss: 'gainloss',
      holdings: 'holdings',
    };
    return reportTypeMap[activeReport] || 'performance';
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    return (
      <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
        {activeReport === 'performance' && <PerformanceReport />}
        {activeReport === 'allocation' && <AllocationReport />}
        {activeReport === 'income' && <IncomeReport />}
        {activeReport === 'activity' && <ActivityReport />}
        {activeReport === 'gainLoss' && <GainLossReport />}
        {activeReport === 'holdings' && <HoldingsReport />}
      </Suspense>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeReport}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Performance" value="performance" />
          <Tab label="Allocation" value="allocation" />
          <Tab label="Income" value="income" />
          <Tab label="Activity" value="activity" />
          <Tab label="Gain/Loss" value="gainLoss" />
          <Tab label="Holdings" value="holdings" />
        </Tabs>

        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Account"
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">All Accounts</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {(activeReport === 'performance' ||
              activeReport === 'income' ||
              activeReport === 'activity' ||
              activeReport === 'gainLoss') && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <Button variant="contained" fullWidth onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>{renderReportContent()}</Paper>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        reportType={getReportType()}
        filters={{
          startDate,
          endDate,
          accountId: accountFilter,
        }}
      />

      {/* Feedback Button */}
      <FeedbackButton page="Reports" />
    </Container>
  );
};
