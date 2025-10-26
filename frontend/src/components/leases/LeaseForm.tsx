import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Stack,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProperties } from '../../store/propertiesSlice';
import { fetchTenants } from '../../store/tenantsSlice';
import type { Lease } from '../../store/leasesSlice';

interface LeaseFormProps {
  lease?: Lease;
  onSubmit: (data: Partial<Lease>) => void;
  onCancel: () => void;
  propertyId?: string; // Optional: if provided, the property selector will be hidden
}

export const LeaseForm: React.FC<LeaseFormProps> = ({ lease, onSubmit, onCancel, propertyId }) => {
  const dispatch = useAppDispatch();
  const { properties } = useAppSelector((state) => state.properties);
  const { tenants } = useAppSelector((state) => state.tenants);

  const [formData, setFormData] = useState({
    propertyId: propertyId || lease?.propertyId || '',
    tenantId: lease?.tenantId || '',
    startDate: lease?.startDate ? lease.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: lease?.endDate ? lease.endDate.split('T')[0] : '',
    monthlyRent: lease?.monthlyRent || 0,
    securityDeposit: lease?.securityDeposit || 0,
    depositHeld: lease?.depositHeld || 0,
    leaseTermMonths: lease?.leaseTermMonths || 12,
    renewalOption: lease?.renewalOption || false,
    autoRenewal: lease?.autoRenewal || false,
    notes: lease?.notes || '',
  });

  useEffect(() => {
    dispatch(fetchProperties());
    if (propertyId) {
      // Fetch tenants for this specific property
      dispatch(fetchTenants({ isActive: true, propertyId }));
    } else {
      dispatch(fetchTenants({ isActive: true }));
    }
  }, [dispatch, propertyId]);

  // Auto-calculate end date when start date or term changes
  useEffect(() => {
    if (formData.startDate && formData.leaseTermMonths) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + formData.leaseTermMonths);
      setFormData((prev) => ({
        ...prev,
        endDate: end.toISOString().split('T')[0],
      }));
    }
  }, [formData.startDate, formData.leaseTermMonths]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      monthlyRent: Number(formData.monthlyRent),
      securityDeposit: Number(formData.securityDeposit),
      depositHeld: Number(formData.depositHeld),
      leaseTermMonths: Number(formData.leaseTermMonths),
    } as any);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Property and Tenant Selection */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Property & Tenant
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

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

        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            required
            label="Tenant"
            value={formData.tenantId}
            onChange={(e) => handleChange('tenantId', e.target.value)}
            SelectProps={{ native: true }}
            helperText={tenants.length === 0 ? "No active tenants found. Please add a tenant to this property first." : "Select the tenant for this lease"}
            error={tenants.length === 0}
          >
            <option value="">Select a tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.firstName} {tenant.lastName}
              </option>
            ))}
          </TextField>
        </Grid>

        {/* Lease Dates */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold" mt={2}>
            Lease Term
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="date"
            label="Start Date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="number"
            label="Lease Term (Months)"
            value={formData.leaseTermMonths}
            onChange={(e) => handleChange('leaseTermMonths', e.target.value)}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="date"
            label="End Date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Financial Details */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold" mt={2}>
            Financial Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="number"
            label="Monthly Rent"
            value={formData.monthlyRent}
            onChange={(e) => handleChange('monthlyRent', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Security Deposit"
            value={formData.securityDeposit}
            onChange={(e) => handleChange('securityDeposit', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Deposit Held"
            value={formData.depositHeld}
            onChange={(e) => handleChange('depositHeld', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </Grid>

        {/* Renewal Options */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold" mt={2}>
            Renewal Options
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.renewalOption}
                onChange={(e) => handleChange('renewalOption', e.target.checked)}
              />
            }
            label="Renewal Option Available"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.autoRenewal}
                onChange={(e) => handleChange('autoRenewal', e.target.checked)}
              />
            }
            label="Auto-Renewal"
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
            placeholder="Additional notes about the lease..."
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {lease ? 'Update' : 'Create'} Lease
        </Button>
      </Stack>
    </Box>
  );
};
