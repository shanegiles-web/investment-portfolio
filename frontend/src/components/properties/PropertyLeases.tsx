import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as LeaseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchLeases, createLease, type Lease, LeaseStatus } from '../../store/leasesSlice';
import { fetchTenants } from '../../store/tenantsSlice';
import { LeaseForm } from '../leases/LeaseForm';
import type { Property } from '../../store/propertiesSlice';

interface PropertyLeasesProps {
  property: Property;
}

export const PropertyLeases: React.FC<PropertyLeasesProps> = ({ property }) => {
  const dispatch = useAppDispatch();
  const { leases, loading, error } = useAppSelector((state) => state.leases);
  const { tenants } = useAppSelector((state) => state.tenants);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeaseStatus | undefined>(LeaseStatus.ACTIVE);

  useEffect(() => {
    dispatch(fetchLeases({ propertyId: property.id, status: filterStatus }));
    dispatch(fetchTenants({ propertyId: property.id, isActive: true }));
  }, [dispatch, property.id, filterStatus]);

  const handleAddLeaseClick = () => {
    // Check if there are active tenants for this property
    const propertyTenants = tenants.filter(t => t.propertyId === property.id && t.isActive);
    if (propertyTenants.length === 0) {
      alert('Please add a tenant to this property before creating a lease.');
      return;
    }
    setIsFormOpen(true);
  };

  const handleCreateLease = async (data: Partial<Lease>) => {
    try {
      await dispatch(createLease({ ...data, propertyId: property.id } as any)).unwrap();
      setIsFormOpen(false);
      // Refresh the leases list
      dispatch(fetchLeases({ propertyId: property.id, status: filterStatus }));
    } catch (error: any) {
      console.error('Error creating lease:', error);
      // Error will be displayed via the error state from Redux
    }
  };

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
      case LeaseStatus.EXPIRED:
        return 'error';
      case LeaseStatus.TERMINATED:
        return 'default';
      case LeaseStatus.PENDING:
        return 'warning';
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

  // Filter leases for this property
  const propertyLeases = leases.filter(lease => lease.propertyId === property.id);

  if (loading && propertyLeases.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Leases ({propertyLeases.length})
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant={filterStatus === undefined ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterStatus(undefined)}
          >
            All
          </Button>
          <Button
            variant={filterStatus === LeaseStatus.ACTIVE ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterStatus(LeaseStatus.ACTIVE)}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === LeaseStatus.EXPIRED ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterStatus(LeaseStatus.EXPIRED)}
          >
            Expired
          </Button>
          <Button
            variant={filterStatus === LeaseStatus.PENDING ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterStatus(LeaseStatus.PENDING)}
          >
            Pending
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddLeaseClick}
            sx={{ ml: 2 }}
          >
            Add Lease
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {propertyLeases.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <LeaseIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No leases found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Add your first lease to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddLeaseClick}
              >
                Add Lease
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Monthly Rent</TableCell>
                <TableCell>Security Deposit</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {propertyLeases.map((lease) => {
                const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
                const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

                return (
                  <TableRow
                    key={lease.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {lease.tenantName}
                          </Typography>
                          {lease.tenantContact && (
                            <Typography variant="caption" color="text.secondary">
                              {lease.tenantContact}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(lease.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(lease.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(lease.monthlyRent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatCurrency(lease.securityDeposit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={lease.status}
                        color={getStatusColor(lease.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {isExpiringSoon && (
                        <Chip
                          icon={<WarningIcon />}
                          label={`${daysUntilExpiry} days`}
                          color="warning"
                          size="small"
                        />
                      )}
                      {daysUntilExpiry < 0 && (
                        <Chip
                          label="Expired"
                          color="error"
                          size="small"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Lease Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Lease</DialogTitle>
        <DialogContent>
          <LeaseForm
            onSubmit={handleCreateLease}
            onCancel={() => setIsFormOpen(false)}
            propertyId={property.id}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
