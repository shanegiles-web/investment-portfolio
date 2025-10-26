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
  AccountBalance as AccountBalanceIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchHoldingsReport } from '../../store/reportsSlice';

const HoldingsReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { holdings, filters, loading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchHoldingsReport(filters));
  }, [dispatch, filters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!holdings) {
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
        <AccountBalanceIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Holdings Data Available
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Apply filters above to generate your holdings report
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
        <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Holdings Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete portfolio holdings overview
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    Total Holdings
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {holdings.summary.totalHoldings}
                  </Typography>
                </Box>
                <ChartIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                    Total Value
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(holdings.summary.totalValue)}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Cost Basis
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(holdings.summary.totalCostBasis)}
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background:
                holdings.summary.totalGainLoss >= 0
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
                    Total Gain/Loss
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(holdings.summary.totalGainLoss)}
                  </Typography>
                  <Chip
                    icon={holdings.summary.totalGainLossPercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={formatPercent(holdings.summary.totalGainLossPercent)}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                {holdings.summary.totalGainLoss >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Holdings Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            All Holdings
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Symbol</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Value</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cost Basis</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gain/Loss</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Return %</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>% of Portfolio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdings.holdings.map((holding, index) => (
                  <TableRow
                    key={holding.positionId}
                    sx={{
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
                      backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.02),
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={holding.symbol}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>{holding.name}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                      {holding.quantity.toFixed(4)}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(holding.currentPrice)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(holding.currentValue)}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(holding.costBasis)}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: holding.gainLoss >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                        {holding.gainLoss >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                        {formatCurrency(holding.gainLoss)}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatPercent(holding.gainLossPercent)}
                        size="small"
                        color={holding.gainLossPercent >= 0 ? 'success' : 'error'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                      {formatPercent(holding.percentOfPortfolio)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HoldingsReport;
