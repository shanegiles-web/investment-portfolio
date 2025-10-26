import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Description as LeaseIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchLeases, createLease, fetchExpiringLeases, type Lease, LeaseStatus } from '../../store/leasesSlice';
import { LeaseForm } from './LeaseForm';
import { PageContainer } from '../PageContainer';

export const LeasesList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { leases, expiringLeases, loading, error } = useAppSelector((state) => state.leases);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeaseStatus | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchLeases({ status: filterStatus }));
    dispatch(fetchExpiringLeases(30));
  }, [dispatch, filterStatus]);

  const handleCreateLease = async (data: Partial<Lease>) => {
    await dispatch(createLease(data as any)).unwrap();
    setIsFormOpen(false);
  };

  const handleLeaseClick = (leaseId: string) => {
    navigate(`/leases/${leaseId}`);
  };

  const filteredLeases = leases.filter((lease) => {
    const query = searchQuery.toLowerCase();
    return (
      lease.tenantName.toLowerCase().includes(query) ||
      lease.property?.address.toLowerCase().includes(query) ||
      lease.tenantContact?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: LeaseStatus) => {
    switch (status) {
      case LeaseStatus.ACTIVE:
        return 'success';
      case LeaseStatus.PENDING:
        return 'warning';
      case LeaseStatus.EXPIRED:
        return 'error';
      case LeaseStatus.TERMINATED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && leases.length === 0) {
    return (
      <PageContainer>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Leases
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Leases
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
        >
          Add Lease
        </Button>
      </Box>

      {/* Expiring Leases Alert */}
      {expiringLeases.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium">
            {expiringLeases.length} lease{expiringLeases.length !== 1 ? 's' : ''} expiring in the next 30 days
          </Typography>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search leases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label="All"
                  onClick={() => setFilterStatus(undefined)}
                  color={filterStatus === undefined ? 'primary' : 'default'}
                  variant={filterStatus === undefined ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Active"
                  onClick={() => setFilterStatus(LeaseStatus.ACTIVE)}
                  color={filterStatus === LeaseStatus.ACTIVE ? 'success' : 'default'}
                  variant={filterStatus === LeaseStatus.ACTIVE ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Pending"
                  onClick={() => setFilterStatus(LeaseStatus.PENDING)}
                  color={filterStatus === LeaseStatus.PENDING ? 'warning' : 'default'}
                  variant={filterStatus === LeaseStatus.PENDING ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Expired"
                  onClick={() => setFilterStatus(LeaseStatus.EXPIRED)}
                  color={filterStatus === LeaseStatus.EXPIRED ? 'error' : 'default'}
                  variant={filterStatus === LeaseStatus.EXPIRED ? 'filled' : 'outlined'}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leases Grid */}
      {filteredLeases.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <LeaseIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No leases found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Get started by adding your first lease'}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsFormOpen(true)}
                >
                  Add Lease
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredLeases.map((lease) => {
            const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
            const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

            return (
              <Grid item xs={12} sm={6} md={4} key={lease.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: isExpiringSoon ? '2px solid' : 'none',
                    borderColor: isExpiringSoon ? 'warning.main' : 'transparent',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleLeaseClick(lease.id)}
                >
                  <CardContent>
                    {/* Status and Warning */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip
                        label={lease.status}
                        color={getStatusColor(lease.status)}
                        size="small"
                      />
                      {isExpiringSoon && (
                        <Chip
                          icon={<WarningIcon />}
                          label={`${daysUntilExpiry} days left`}
                          color="warning"
                          size="small"
                        />
                      )}
                    </Box>

                    {/* Tenant Name */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <PersonIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="h6" noWrap>
                        {lease.tenantName}
                      </Typography>
                    </Box>

                    {/* Property Address */}
                    {lease.property && (
                      <Box display="flex" alignItems="center" mb={2}>
                        <HomeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {lease.property.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lease.property.city}, {lease.property.state}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Lease Dates */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <CalendarIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                      </Typography>
                    </Box>

                    {/* Monthly Rent */}
                    <Box display="flex" alignItems="center" p={1.5} bgcolor="grey.50" borderRadius={1}>
                      <MoneyIcon sx={{ fontSize: 18, mr: 1, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontSize={12}>
                          Monthly Rent
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatCurrency(lease.monthlyRent)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Security Deposit */}
                    {lease.securityDeposit > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        Security Deposit: {formatCurrency(lease.securityDeposit)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Lease Dialog */}
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Lease</DialogTitle>
        <DialogContent>
          <LeaseForm onSubmit={handleCreateLease} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};
