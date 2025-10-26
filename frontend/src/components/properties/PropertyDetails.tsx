import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import type { Property } from '../../store/propertiesSlice';
import {
  fetchPropertyById,
  updateProperty,
  deleteProperty,
  setCurrentProperty,
  uploadPropertyImages,
} from '../../store/propertiesSlice';
import { PageContainer } from '../PageContainer';
import { PropertyForm } from './PropertyForm';
import { PropertyImages } from './PropertyImages';
import { PropertyFinancials } from './PropertyFinancials';
import { PropertyExpenses } from './PropertyExpenses';
import { PropertyIncome } from './PropertyIncome';
import { PropertyTenants } from './PropertyTenants';
import { PropertyLeases } from './PropertyLeases';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProperty, loading, error } = useAppSelector((state) => state.properties);

  const [activeTab, setActiveTab] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyById(id));
    }

    return () => {
      dispatch(setCurrentProperty(null));
    };
  }, [dispatch, id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = async (data: Partial<Property>, imageFiles?: File[]) => {
    if (!currentProperty) return;

    try {
      await dispatch(
        updateProperty({ id: currentProperty.id, data })
      ).unwrap();

      // Upload images if any were provided
      if (imageFiles && imageFiles.length > 0) {
        await dispatch(uploadPropertyImages({
          propertyId: currentProperty.id,
          files: imageFiles
        })).unwrap();
      }

      setIsEditDialogOpen(false);
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const handleDelete = async () => {
    if (!currentProperty) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${currentProperty.address}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteProperty(currentProperty.id)).unwrap();
      navigate('/properties');
    } catch (err) {
      // Error is handled by Redux
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !currentProperty) {
    return (
      <PageContainer>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Loading...
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Error
        </Typography>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/properties')} sx={{ mt: 2 }}>
          Back to Properties
        </Button>
      </PageContainer>
    );
  }

  if (!currentProperty) {
    return (
      <PageContainer>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Not Found
        </Typography>
        <Alert severity="warning">Property not found</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/properties')} sx={{ mt: 2 }}>
          Back to Properties
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/properties')}
          sx={{ mb: 2 }}
        >
          Back to Properties
        </Button>

        {/* Property Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
            {/* Property Image */}
            {(currentProperty.primaryImageUrl || (currentProperty.imageUrls && Array.isArray(currentProperty.imageUrls) && currentProperty.imageUrls.length > 0)) && (
              <Box
                component="img"
                src={currentProperty.primaryImageUrl
                  ? currentProperty.primaryImageUrl
                  : currentProperty.imageUrls[0]
                }
                alt={currentProperty.address}
                sx={{
                  width: 200,
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
            )}

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  label={currentProperty.propertyType.replace(/_/g, ' ')}
                  color="primary"
                />
                <Typography variant="h5" fontWeight="bold">
                  {currentProperty.address}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {currentProperty.city}, {currentProperty.state} {currentProperty.zip}
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(currentProperty.purchaseDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Price
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(currentProperty.purchasePrice)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Current Value
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    {formatCurrency(currentProperty.currentValue)}
                  </Typography>
                </Grid>

                {currentProperty.loanBalance > 0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Loan Balance
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="warning.main">
                      {formatCurrency(currentProperty.loanBalance)}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {(currentProperty.bedrooms ||
                currentProperty.bathrooms ||
                currentProperty.squareFeet) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    {currentProperty.bedrooms && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Bedrooms
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentProperty.bedrooms}
                        </Typography>
                      </Box>
                    )}
                    {currentProperty.bathrooms && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Bathrooms
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentProperty.bathrooms}
                        </Typography>
                      </Box>
                    )}
                    {currentProperty.squareFeet && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Square Feet
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentProperty.squareFeet.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    {currentProperty.numberOfUnits && currentProperty.numberOfUnits > 1 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Units
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentProperty.numberOfUnits}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="primary"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />
            <Tab label="Tenants" />
            <Tab label="Leases" />
            <Tab label="Financials" />
            <Tab label="Income" />
            <Tab label="Expenses" />
            <Tab label="Images" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>
                Property Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View and manage all aspects of your property using the tabs above.
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      Financial Information
                    </Typography>
                    {currentProperty.loanAmount && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">Loan Amount</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(currentProperty.loanAmount)}
                        </Typography>
                      </Box>
                    )}
                    {currentProperty.loanInterestRate && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">Interest Rate</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {currentProperty.loanInterestRate}%
                        </Typography>
                      </Box>
                    )}
                    {currentProperty.monthlyMortgagePayment && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">Monthly Payment</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(currentProperty.monthlyMortgagePayment)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      Additional Costs
                    </Typography>
                    {currentProperty.refurbishCosts && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">Refurbish Costs</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(currentProperty.refurbishCosts)}
                        </Typography>
                      </Box>
                    )}
                    {currentProperty.furnishCosts && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">Furnish Costs</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(currentProperty.furnishCosts)}
                        </Typography>
                      </Box>
                    )}
                    {currentProperty.acquisitionCosts && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">Acquisition Costs</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(currentProperty.acquisitionCosts)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <PropertyTenants property={currentProperty} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <PropertyLeases property={currentProperty} />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <PropertyFinancials property={currentProperty} />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <PropertyIncome property={currentProperty} />
            </TabPanel>

            <TabPanel value={activeTab} index={5}>
              <PropertyExpenses property={currentProperty} />
            </TabPanel>

            <TabPanel value={activeTab} index={6}>
              <PropertyImages property={currentProperty} />
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Property</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <PropertyForm
              property={currentProperty}
              onSubmit={handleEdit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};
