import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Step,
  Stepper,
  StepLabel,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Paper,
  Alert,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { Property } from '../../store/propertiesSlice';
import { PropertyType } from '../../store/propertiesSlice';
import { ImageUpload } from './ImageUpload';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchAccounts } from '../../store/accountsSlice';

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: Partial<Property>, imageFiles?: File[]) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  // Basic Info
  accountId?: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string;
  zip: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;

  // Physical Details
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  numberOfUnits?: number;

  // Financial Info
  refurbishCosts?: number;
  furnishCosts?: number;
  acquisitionCosts?: number;
  downPayment?: number;
  loanAmount?: number;
  loanBalance?: number;
  loanInterestRate?: number;
  loanTermYears?: number;
  monthlyMortgagePayment?: number;

  // Operating Parameters
  propertyManagementFeePercent?: number;
  vacancyRatePercent?: number;
  desiredCapRate?: number;
}

const steps = ['Basic Information', 'Physical Details', 'Financial Information', 'Operating Parameters', 'Property Images'];

export const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
  const { accounts } = useAppSelector((state) => state.accounts);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Fetch accounts on mount
  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const [formData, setFormData] = useState<FormData>({
    accountId: property?.accountId,
    propertyType: property?.propertyType || PropertyType.SINGLE_FAMILY,
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zip: property?.zip || '',
    purchaseDate: property?.purchaseDate ? new Date(property.purchaseDate) : new Date(),
    purchasePrice: property?.purchasePrice || 0,
    currentValue: property?.currentValue || 0,
    bedrooms: property?.bedrooms,
    bathrooms: property?.bathrooms,
    squareFeet: property?.squareFeet,
    lotSize: property?.lotSize,
    numberOfUnits: property?.numberOfUnits || 1,
    refurbishCosts: property?.refurbishCosts,
    furnishCosts: property?.furnishCosts,
    acquisitionCosts: property?.acquisitionCosts,
    downPayment: property?.downPayment,
    loanAmount: property?.loanAmount,
    loanBalance: property?.loanBalance || 0,
    loanInterestRate: property?.loanInterestRate,
    loanTermYears: property?.loanTermYears,
    monthlyMortgagePayment: property?.monthlyMortgagePayment,
    propertyManagementFeePercent: property?.propertyManagementFeePercent || 0,
    vacancyRatePercent: property?.vacancyRatePercent || 0,
    desiredCapRate: property?.desiredCapRate,
  });

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) {
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateBasicInfo = (): boolean => {
    if (!formData.address || !formData.city || !formData.state || !formData.zip) {
      setError('Please fill in all required address fields');
      return false;
    }
    if (formData.purchasePrice <= 0) {
      setError('Purchase price must be greater than 0');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateBasicInfo()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData: Partial<Property> = {
        ...formData,
        purchaseDate: formData.purchaseDate.toISOString(),
      };

      await onSubmit(submitData, imageFiles);
    } catch (err: any) {
      setError(err.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Property Type"
                value={formData.propertyType}
                onChange={(e) => handleChange('propertyType', e.target.value as PropertyType)}
                required
              >
                {Object.values(PropertyType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Account"
                value={formData.accountId || ''}
                onChange={(e) => handleChange('accountId', e.target.value || undefined)}
                helperText="Select which account holds this property (optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName} ({account.accountType})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
                required
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={(date) => handleChange('purchaseDate', date || new Date())}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Value"
                type="number"
                value={formData.currentValue}
                onChange={(e) => handleChange('currentValue', parseFloat(e.target.value) || 0)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || undefined)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value) || undefined)}
                inputProps={{ step: 0.5 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Square Feet"
                type="number"
                value={formData.squareFeet || ''}
                onChange={(e) => handleChange('squareFeet', parseFloat(e.target.value) || undefined)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lot Size (acres)"
                type="number"
                value={formData.lotSize || ''}
                onChange={(e) => handleChange('lotSize', parseFloat(e.target.value) || undefined)}
                inputProps={{ step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Units"
                type="number"
                value={formData.numberOfUnits || 1}
                onChange={(e) => handleChange('numberOfUnits', parseInt(e.target.value) || 1)}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Costs
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Refurbish Costs"
                type="number"
                value={formData.refurbishCosts || ''}
                onChange={(e) => handleChange('refurbishCosts', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Furnish Costs"
                type="number"
                value={formData.furnishCosts || ''}
                onChange={(e) => handleChange('furnishCosts', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Acquisition Costs"
                type="number"
                value={formData.acquisitionCosts || ''}
                onChange={(e) => handleChange('acquisitionCosts', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Loan Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Down Payment"
                type="number"
                value={formData.downPayment || ''}
                onChange={(e) => handleChange('downPayment', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Amount"
                type="number"
                value={formData.loanAmount || ''}
                onChange={(e) => handleChange('loanAmount', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Loan Balance"
                type="number"
                value={formData.loanBalance || ''}
                onChange={(e) => handleChange('loanBalance', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interest Rate"
                type="number"
                value={formData.loanInterestRate || ''}
                onChange={(e) => handleChange('loanInterestRate', parseFloat(e.target.value) || undefined)}
                InputProps={{ endAdornment: '%' }}
                inputProps={{ step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Term (Years)"
                type="number"
                value={formData.loanTermYears || ''}
                onChange={(e) => handleChange('loanTermYears', parseInt(e.target.value) || undefined)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Mortgage Payment"
                type="number"
                value={formData.monthlyMortgagePayment || ''}
                onChange={(e) => handleChange('monthlyMortgagePayment', parseFloat(e.target.value) || undefined)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                These parameters help calculate your property's financial performance
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Property Management Fee"
                type="number"
                value={formData.propertyManagementFeePercent || ''}
                onChange={(e) =>
                  handleChange('propertyManagementFeePercent', parseFloat(e.target.value) || undefined)
                }
                InputProps={{ endAdornment: '%' }}
                inputProps={{ step: 0.1 }}
                helperText="Percentage of gross rent"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Vacancy Rate"
                type="number"
                value={formData.vacancyRatePercent || ''}
                onChange={(e) => handleChange('vacancyRatePercent', parseFloat(e.target.value) || undefined)}
                InputProps={{ endAdornment: '%' }}
                inputProps={{ step: 0.1 }}
                helperText="Expected vacancy percentage"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Desired Cap Rate"
                type="number"
                value={formData.desiredCapRate || ''}
                onChange={(e) => handleChange('desiredCapRate', parseFloat(e.target.value) || undefined)}
                InputProps={{ endAdornment: '%' }}
                inputProps={{ step: 0.1 }}
                helperText="Target capitalization rate"
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Property Images (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload photos of your property. The first image will be set as the primary image.
            </Typography>
            <ImageUpload
              onUpload={async (files) => {
                // This is only called when not in autoNotify mode
                setImageFiles(files);
              }}
              onChange={(files) => {
                // This is called when files are selected in autoNotify mode
                setImageFiles(files);
              }}
              maxFiles={10}
              maxSizeMB={10}
              disabled={loading}
              autoNotify={true}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>{renderStepContent(activeStep)}</Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
