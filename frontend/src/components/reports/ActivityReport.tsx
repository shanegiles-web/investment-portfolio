import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchActivityReport } from '../../store/reportsSlice';

const ActivityReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { activity, filters, loading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchActivityReport(filters));
  }, [dispatch, filters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box
        p={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderRadius: 2,
          minHeight: 400,
        }}
      >
        <TimelineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Activity Data Available
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Apply filters above to generate your portfolio activity summary
        </Typography>
      </Box>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Portfolio Activity Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete overview of portfolio cash flows and transactions
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Transactions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {activity.summary.totalTransactions}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Inflows
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(activity.summary.totalInflows)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Outflows
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(activity.summary.totalOutflows)}
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background:
                activity.summary.netFlow >= 0
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Net Flow
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(activity.summary.netFlow)}
                  </Typography>
                </Box>
                <SwapIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityReport;
