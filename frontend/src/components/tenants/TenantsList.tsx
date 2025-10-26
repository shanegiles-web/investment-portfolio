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
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchTenants, createTenant, type Tenant } from '../../store/tenantsSlice';
import { TenantForm } from './TenantForm';
import { PageContainer } from '../PageContainer';

export const TenantsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tenants, loading, error } = useAppSelector((state) => state.tenants);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchTenants({ isActive: filterActive }));
  }, [dispatch, filterActive]);

  const handleCreateTenant = async (data: Partial<Tenant>) => {
    await dispatch(createTenant(data as any)).unwrap();
    setIsFormOpen(false);
  };

  const handleTenantClick = (tenantId: string) => {
    navigate(`/tenants/${tenantId}`);
  };

  const filteredTenants = tenants.filter((tenant) => {
    const query = searchQuery.toLowerCase();
    return (
      tenant.firstName.toLowerCase().includes(query) ||
      tenant.lastName.toLowerCase().includes(query) ||
      tenant.email?.toLowerCase().includes(query) ||
      tenant.phone?.includes(query) ||
      tenant.property?.address.toLowerCase().includes(query)
    );
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading && tenants.length === 0) {
    return (
      <PageContainer>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Tenants
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
          Tenants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
        >
          Add Tenant
        </Button>
      </Box>

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
                placeholder="Search tenants..."
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
              <Stack direction="row" spacing={1}>
                <Chip
                  label="All"
                  onClick={() => setFilterActive(undefined)}
                  color={filterActive === undefined ? 'primary' : 'default'}
                  variant={filterActive === undefined ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Active"
                  onClick={() => setFilterActive(true)}
                  color={filterActive === true ? 'success' : 'default'}
                  variant={filterActive === true ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Moved Out"
                  onClick={() => setFilterActive(false)}
                  color={filterActive === false ? 'default' : 'default'}
                  variant={filterActive === false ? 'filled' : 'outlined'}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tenants Grid */}
      {filteredTenants.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tenants found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Get started by adding your first tenant'}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsFormOpen(true)}
                >
                  Add Tenant
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTenants.map((tenant) => (
            <Grid item xs={12} sm={6} md={4} key={tenant.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleTenantClick(tenant.id)}
              >
                <CardContent>
                  {/* Tenant Header */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                      {getInitials(tenant.firstName, tenant.lastName)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">
                        {tenant.firstName} {tenant.lastName}
                      </Typography>
                      <Chip
                        size="small"
                        icon={tenant.isActive ? <ActiveIcon /> : <InactiveIcon />}
                        label={tenant.isActive ? 'Active' : 'Moved Out'}
                        color={tenant.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>

                  {/* Contact Info */}
                  <Stack spacing={1} mb={2}>
                    {tenant.email && (
                      <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {tenant.email}
                        </Typography>
                      </Box>
                    )}
                    {tenant.phone && (
                      <Box display="flex" alignItems="center">
                        <PhoneIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {tenant.phone}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Property Info */}
                  {tenant.property && (
                    <Box
                      display="flex"
                      alignItems="center"
                      p={1.5}
                      bgcolor="grey.50"
                      borderRadius={1}
                    >
                      <HomeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {tenant.property.address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tenant.property.city}, {tenant.property.state}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Move-in Date */}
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Move-in: {new Date(tenant.moveInDate).toLocaleDateString()}
                    </Typography>
                    {tenant.moveOutDate && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Move-out: {new Date(tenant.moveOutDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Tenant Dialog */}
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Tenant</DialogTitle>
        <DialogContent>
          <TenantForm onSubmit={handleCreateTenant} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};
