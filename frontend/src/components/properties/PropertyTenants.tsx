import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchTenants, createTenant, type Tenant } from '../../store/tenantsSlice';
import { TenantForm } from '../tenants/TenantForm';
import type { Property } from '../../store/propertiesSlice';

interface PropertyTenantsProps {
  property: Property;
}

export const PropertyTenants: React.FC<PropertyTenantsProps> = ({ property }) => {
  const dispatch = useAppDispatch();
  const { tenants, loading, error } = useAppSelector((state) => state.tenants);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true);

  useEffect(() => {
    dispatch(fetchTenants({ propertyId: property.id, isActive: filterActive }));
  }, [dispatch, property.id, filterActive]);

  const handleCreateTenant = async (data: Partial<Tenant>) => {
    console.log('🔷 [PropertyTenants] handleCreateTenant called');
    console.log('📝 Tenant data:', { ...data, propertyId: property.id });

    try {
      console.log('⏳ [PropertyTenants] Dispatching createTenant action...');
      const result = await dispatch(createTenant({ ...data, propertyId: property.id } as any)).unwrap();
      console.log('✅ [PropertyTenants] Tenant created successfully:', result);

      setIsFormOpen(false);
      console.log('🔄 [PropertyTenants] Refreshing tenants list...');

      // Refresh the tenants list
      dispatch(fetchTenants({ propertyId: property.id, isActive: filterActive }));
    } catch (error: any) {
      console.error('❌ [PropertyTenants] Error creating tenant:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      // Error will be displayed via the error state from Redux
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter tenants for this property
  const propertyTenants = tenants.filter(tenant => tenant.propertyId === property.id);

  if (loading && propertyTenants.length === 0) {
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
          Tenants ({propertyTenants.length})
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant={filterActive === undefined ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterActive(undefined)}
          >
            All
          </Button>
          <Button
            variant={filterActive === true ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterActive(true)}
          >
            Active
          </Button>
          <Button
            variant={filterActive === false ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterActive(false)}
          >
            Inactive
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsFormOpen(true)}
            sx={{ ml: 2 }}
          >
            Add Tenant
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {propertyTenants.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tenants found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Add your first tenant to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsFormOpen(true)}
              >
                Add Tenant
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
                <TableCell>Contact</TableCell>
                <TableCell>Move In Date</TableCell>
                <TableCell>Move Out Date</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {propertyTenants.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(tenant.firstName, tenant.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {tenant.firstName} {tenant.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {tenant.email && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{tenant.email}</Typography>
                        </Box>
                      )}
                      {tenant.phone && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{tenant.phone}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(tenant.moveInDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {tenant.moveOutDate ? formatDate(tenant.moveOutDate) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={tenant.isActive ? <ActiveIcon /> : <InactiveIcon />}
                      label={tenant.isActive ? 'Active' : 'Inactive'}
                      color={tenant.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Tenant Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Tenant</DialogTitle>
        <DialogContent>
          <TenantForm
            onSubmit={handleCreateTenant}
            onCancel={() => setIsFormOpen(false)}
            propertyId={property.id}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
