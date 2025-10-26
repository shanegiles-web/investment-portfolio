import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchDashboardData } from '../store/dashboardSlice';
import { PageContainer } from '../components';
import { FeedbackButton } from '../components/common/FeedbackButton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box>
        <Alert severity="info">No dashboard data available</Alert>
      </Box>
    );
  }

  const { summary, allocation, transactions, topPositions, topPerformers, bottomPerformers, recentActivity, monthlyActivity } = data;

  return (
    <PageContainer>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Portfolio Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your investment portfolio
        </Typography>
      </Box>

      {/* Summary Cards - 4 Across */}
      <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Portfolio Value
              </Typography>
              <Typography variant="h4" color="primary.main" sx={{ mb: 0.5 }}>
                {formatCurrency(summary.totalValue)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {summary.positionCount} positions • {summary.accountCount} accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Total Gain/Loss
              </Typography>
              <Typography
                variant="h4"
                color={summary.totalGainLoss >= 0 ? 'success.main' : 'error.main'}
                sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {summary.totalGainLoss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {formatCurrency(Math.abs(summary.totalGainLoss))}
              </Typography>
              <Typography
                variant="caption"
                color={summary.percentGainLoss >= 0 ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {formatPercent(summary.percentGainLoss)} return
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Cost Basis
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {formatCurrency(summary.totalCostBasis)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total invested
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Net Cash Flow
              </Typography>
              <Typography
                variant="h4"
                color={transactions.netFlow >= 0 ? 'success.main' : 'error.main'}
                sx={{ mb: 0.5 }}
              >
                {formatCurrency(transactions.netFlow)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {transactions.totalCount} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Large Charts Row */}
      <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Monthly Cash Flow
              </Typography>
              {monthlyActivity.length > 0 ? (
                <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyActivity} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="month"
                        style={{ fontSize: '15px', fontWeight: 500 }}
                        tick={{ fill: '#666' }}
                      />
                      <YAxis
                        style={{ fontSize: '15px', fontWeight: 500 }}
                        tick={{ fill: '#666' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{
                          fontSize: '15px',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '25px', fontSize: '15px', fontWeight: 500 }}
                        iconSize={16}
                      />
                      <Bar
                        dataKey="inflows"
                        fill="#00C49F"
                        name="Inflows"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                      <Bar
                        dataKey="outflows"
                        fill="#FF8042"
                        name="Outflows"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary" variant="h6">No transaction data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Asset Allocation
              </Typography>
              {allocation.byCategory.length > 0 ? (
                <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation.byCategory}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="40%"
                        outerRadius={120}
                        label={(entry) => {
                          return `${entry.percentage.toFixed(1)}%`;
                        }}
                        labelLine={{ stroke: '#666', strokeWidth: 2 }}
                        style={{ fontSize: '16px', fontWeight: 600 }}
                      >
                        {allocation.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{
                          fontSize: '15px',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={70}
                        iconSize={16}
                        wrapperStyle={{ fontSize: '15px', fontWeight: 500, paddingTop: '30px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary" variant="h6">No allocation data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account Breakdown - Full Width */}
      {allocation.byAccount.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Accounts
            </Typography>
            <Grid container spacing={2} sx={{ width: '100%' }}>
              {allocation.byAccount.map((account) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={account.accountId}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {account.accountName}
                      </Typography>
                      <Chip label={account.taxTreatment} size="small" />
                    </Box>
                    <Typography variant="h5" color="primary.main" sx={{ mb: 0.5 }}>
                      {formatCurrency(account.value)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={account.gainLoss >= 0 ? 'success.main' : 'error.main'}
                      sx={{ mb: 1 }}
                    >
                      {account.gainLoss >= 0 ? '+' : ''}{formatCurrency(account.gainLoss)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {account.percentage.toFixed(1)}% of portfolio
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {account.positionCount} position{account.positionCount !== 1 ? 's' : ''}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Lists Row - Three Columns */}
      <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Holdings
              </Typography>
              <List dense disablePadding>
                {topPositions.slice(0, 5).map((position, index) => (
                  <ListItem key={position.id} divider={index < 4} sx={{ px: 0 }}>
                    <ListItemText disableTypography primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {position.symbol || position.name.substring(0, 20)}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(position.currentValue)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="textSecondary">
                            {position.percentage.toFixed(1)}% of portfolio
                          </Typography>
                          <Typography
                            variant="caption"
                            color={position.gainLoss >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatPercent(position.percentGainLoss)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <List dense disablePadding>
                {topPerformers.slice(0, 5).map((performer, index) => (
                  <ListItem key={performer.id} divider={index < 4} sx={{ px: 0 }}>
                    <ListItemText disableTypography primary={
                        <Typography variant="body2" fontWeight={500}>
                          {performer.symbol || performer.name.substring(0, 25)}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="success.main" fontWeight={600}>
                            {formatPercent(performer.percentGainLoss)}
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            {formatCurrency(performer.gainLoss)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense disablePadding>
                {recentActivity.slice(0, 5).map((txn, index) => (
                  <ListItem key={txn.id} divider={index < 4} sx={{ px: 0 }}>
                    <ListItemText disableTypography primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Chip
                            label={txn.transactionType}
                            size="small"
                            color={
                              ['BUY', 'CONTRIBUTION', 'INCOME'].includes(txn.transactionType)
                                ? 'success'
                                : ['SELL', 'WITHDRAWAL', 'EXPENSE'].includes(txn.transactionType)
                                  ? 'error'
                                  : 'default'
                            }
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(txn.totalAmount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {txn.position
                              ? `${txn.position.name.substring(0, 30)}${txn.position.symbol ? ` (${txn.position.symbol})` : ''}`
                              : txn.account?.accountName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(txn.transactionDate)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Feedback Button */}
      <FeedbackButton page="Dashboard" />
    </PageContainer>
  );
};







