import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Stack,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProperties } from '../../store/propertiesSlice';
import type { Tenant } from '../../store/tenantsSlice';

interface TenantFormProps {
  tenant?: Tenant;
  onSubmit: (data: Partial<Tenant>) => void;
  onCancel: () => void;
  propertyId?: string; // Optional: if provided, the property selector will be hidden
}

export const TenantForm: React.FC<TenantFormProps> = ({ tenant, onSubmit, onCancel, propertyId }) => {
  const dispatch = useAppDispatch();
  const { properties } = useAppSelector((state) => state.properties);

  const [formData, setFormData] = useState({
    propertyId: propertyId || tenant?.propertyId || '',
    firstName: tenant?.firstName || '',
    lastName: tenant?.lastName || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    emergencyContact: tenant?.emergencyContact || '',
    emergencyPhone: tenant?.emergencyPhone || '',
    moveInDate: tenant?.moveInDate ? tenant.moveInDate.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: tenant?.notes || '',
  });

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      moveInDate: new Date(formData.moveInDate).toISOString(),
    } as any);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Property Selection - Only show if propertyId is not provided */}
        {!propertyId && (
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              required
              label="Property"
              value={formData.propertyId}
              onChange={(e) => handleChange('propertyId', e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address} - {property.city}, {property.state}
                </option>
              ))}
            </TextField>
          </Grid>
        )}

        {/* Personal Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            value={formData.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Emergency Contact Phone"
            value={formData.emergencyPhone}
            onChange={(e) => handleChange('emergencyPhone', e.target.value)}
          />
        </Grid>

        {/* Move-in Date */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type="date"
            label="Move-in Date"
            value={formData.moveInDate}
            onChange={(e) => handleChange('moveInDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes about the tenant..."
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {tenant ? 'Update' : 'Create'} Tenant
        </Button>
      </Stack>
    </Box>
  );
};
