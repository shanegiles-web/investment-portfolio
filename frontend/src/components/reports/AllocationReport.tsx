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
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DonutLarge as DonutIcon, AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchAllocationReport } from '../../store/reportsSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const AllocationReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { allocation, filters, loading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchAllocationReport(filters));
  }, [dispatch, filters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!allocation) {
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
        <DonutIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Allocation Data Available
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Apply filters above to generate your asset allocation report
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
    return `${value.toFixed(2)}%`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <DonutIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Asset Allocation Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Portfolio diversification across categories and tax treatments
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Total Portfolio Value Card */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Portfolio Value
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {formatCurrency(allocation.totalValue)}
              </Typography>
            </Box>
            <AccountBalanceIcon sx={{ fontSize: 60, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Pie Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                By Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocation.byCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${formatPercent(entry.percentage)}`}
                  >
                    {allocation.byCategory.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                By Tax Treatment
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocation.byTaxTreatment}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${formatPercent(entry.percentage)}`}
                  >
                    {allocation.byTaxTreatment.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Breakdown Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Detailed Breakdown
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Value</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allocation.byCategory.map((item, index) => (
                  <TableRow
                    key={item.name}
                    sx={{
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
                      backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.02),
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(item.value)}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: alpha(COLORS[index % COLORS.length], 0.1),
                          color: COLORS[index % COLORS.length],
                          fontWeight: 'bold',
                        }}
                      >
                        {formatPercent(item.percentage)}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{item.count}</TableCell>
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

export default AllocationReport;
