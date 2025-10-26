import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchPerformanceReport } from '../../store/reportsSlice';

const PerformanceReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { performance, filters, loading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    // Only fetch if filters are set (user clicked Apply Filters)
    if (Object.keys(filters).length > 0) {
      dispatch(fetchPerformanceReport(filters));
    }
  }, [dispatch, filters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!performance) {
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
        <ChartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Performance Data Available
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Apply filters above to generate your performance report
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

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Performance Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive portfolio performance analysis
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Portfolio Value
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(performance.summary.totalCurrentValue)}
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              background: performance.summary.totalReturn >= 0
                ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Return
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(performance.summary.totalReturn)}
                  </Typography>
                  <Chip
                    icon={performance.summary.totalReturnPercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={formatPercent(performance.summary.totalReturnPercent)}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                {performance.summary.totalReturn >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Cost Basis
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(performance.summary.totalCostBasis)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance by Period */}
      {performance.performanceByPeriod && performance.performanceByPeriod.length > 0 && (
        <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Performance by Period
            </Typography>

            {/* Period Chart */}
            <Box sx={{ height: 300, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance.performanceByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="period" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip
                    formatter={(value: number) => formatPercent(value)}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="returnPercent" name="Return %" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Period Cards */}
            <Grid container spacing={2}>
              {performance.performanceByPeriod.map((period) => (
                <Grid item xs={6} sm={4} md={2} key={period.period}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderColor: period.returnPercent >= 0 ? 'success.main' : 'error.main',
                      borderWidth: 2,
                    }}
                  >
                    <CardContent>
                      <Typography color="text.secondary" variant="body2" fontWeight="medium">
                        {period.period}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={period.returnPercent >= 0 ? 'success.main' : 'error.main'}
                        sx={{ my: 0.5 }}
                      >
                        {formatPercent(period.returnPercent)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={period.gainLoss >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(period.gainLoss)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Top Positions Table */}
      {performance.positions && performance.positions.length > 0 && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Position Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Symbol</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Current Value</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cost Basis</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Return</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Return %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performance.positions.slice(0, 10).map((position, index) => (
                    <TableRow
                      key={position.positionId}
                      sx={{
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
                        backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.02),
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={position.symbol}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>{position.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                        {formatCurrency(position.currentValue)}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(position.costBasis)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: position.totalReturn >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {position.totalReturn >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                          {formatCurrency(position.totalReturn)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={formatPercent(position.totalReturnPercent)}
                          size="small"
                          color={position.totalReturnPercent >= 0 ? 'success' : 'error'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PerformanceReport;
