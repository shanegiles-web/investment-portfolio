import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import type { Property } from '../../store/propertiesSlice';
import { fetchProperties, createProperty, uploadPropertyImages } from '../../store/propertiesSlice';
import { PropertyForm } from './PropertyForm';
import { PageContainer } from '../PageContainer';
import { FeedbackButton } from '../common/FeedbackButton';

export const PropertiesList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { properties, loading, error } = useAppSelector((state) => state.properties);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const handleCreateProperty = async (data: Partial<Property>, imageFiles?: File[]) => {
    const createdProperty = await dispatch(createProperty(data)).unwrap();

    // Upload images if any were provided
    if (imageFiles && imageFiles.length > 0 && createdProperty.id) {
      await dispatch(uploadPropertyImages({
        propertyId: createdProperty.id,
        files: imageFiles
      })).unwrap();
    }

    setIsFormOpen(false);
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const filteredProperties = properties.filter((property) => {
    const query = searchQuery.toLowerCase();
    return (
      property.address.toLowerCase().includes(query) ||
      property.city.toLowerCase().includes(query) ||
      property.state.toLowerCase().includes(query) ||
      property.zip.includes(query)
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

  const getPropertyImage = (property: Property) => {
    if (property.primaryImageUrl) {
      // Use relative URL so it gets proxied through Vite to the backend
      return property.primaryImageUrl;
    }
    if (property.imageUrls && Array.isArray(property.imageUrls) && property.imageUrls.length > 0) {
      // Use relative URL so it gets proxied through Vite to the backend
      return property.imageUrls[0];
    }
    // Return a simple gray SVG placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  };

  if (loading && properties.length === 0) {
    return (
      <PageContainer>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Properties
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Properties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your real estate investment properties
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
        >
          Add Property
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search properties by address, city, state, or ZIP code..."
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
      </Box>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
          }}
        >
          <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery
              ? 'No properties found matching your search'
              : 'No properties yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first property'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
            >
              Add Your First Property
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handlePropertyClick(property.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={getPropertyImage(property)}
                  alt={property.address}
                  sx={{
                    objectFit: 'cover',
                    bgcolor: 'grey.200',
                  }}
                />

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Property Type & Account */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={property.propertyType.replace(/_/g, ' ')}
                      size="small"
                      color="primary"
                    />
                    {property.account && (
                      <Chip
                        label={property.account.accountName}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Address */}
                  <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                    {property.address}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.city}, {property.state} {property.zip}
                    </Typography>
                  </Box>

                  {/* Physical Details */}
                  {(property.bedrooms || property.bathrooms || property.squareFeet) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {property.bedrooms && `${property.bedrooms} bed`}
                      {property.bedrooms && property.bathrooms && ' • '}
                      {property.bathrooms && `${property.bathrooms} bath`}
                      {property.squareFeet && ` • ${property.squareFeet.toLocaleString()} sqft`}
                    </Typography>
                  )}

                  {/* Financial Info */}
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Purchase Price
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(property.purchasePrice)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Value
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(property.currentValue)}
                      </Typography>
                    </Box>

                    {property.loanBalance > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Loan Balance
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="warning.main">
                          {formatCurrency(property.loanBalance)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Property Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Property</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <PropertyForm
              onSubmit={handleCreateProperty}
              onCancel={() => setIsFormOpen(false)}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Feedback Button */}
      <FeedbackButton page="Properties" />
    </PageContainer>
  );
};
