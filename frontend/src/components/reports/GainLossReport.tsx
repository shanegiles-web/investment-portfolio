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
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchGainLossReport } from '../../store/reportsSlice';

const GainLossReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { gainLoss, filters, loading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchGainLossReport(filters));
  }, [dispatch, filters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!gainLoss) {
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
        <AssessmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Gain/Loss Data Available
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Apply filters above to generate your gain/loss report
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
        <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Gain/Loss Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed unrealized and realized gains/losses analysis
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              background:
                gainLoss.summary.totalUnrealizedGainLoss >= 0
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
                    Unrealized Gain/Loss
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(gainLoss.summary.totalUnrealizedGainLoss)}
                  </Typography>
                </Box>
                {gainLoss.summary.totalUnrealizedGainLoss >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              background:
                gainLoss.summary.totalRealizedGainLoss >= 0
                  ? `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Realized Gain/Loss
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(gainLoss.summary.totalRealizedGainLoss)}
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
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
                    Total Gain/Loss
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(gainLoss.summary.totalGainLoss)}
                  </Typography>
                  <Chip
                    icon={gainLoss.summary.totalGainLoss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={gainLoss.summary.totalGainLoss >= 0 ? 'Profit' : 'Loss'}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Unrealized Gains/Losses Table */}
      {gainLoss.unrealizedGains && gainLoss.unrealizedGains.length > 0 && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Unrealized Gains/Losses (Top 10)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Symbol</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Current Value</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cost Basis</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gain/Loss</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Return %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gainLoss.unrealizedGains.slice(0, 10).map((item, index) => (
                    <TableRow
                      key={item.positionId}
                      sx={{
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
                        backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.02),
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={item.symbol}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                        {formatCurrency(item.currentValue)}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.costBasis)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: item.gainLoss >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {item.gainLoss >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                          {formatCurrency(item.gainLoss)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={formatPercent(item.gainLossPercent)}
                          size="small"
                          color={item.gainLossPercent >= 0 ? 'success' : 'error'}
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

export default GainLossReport;
