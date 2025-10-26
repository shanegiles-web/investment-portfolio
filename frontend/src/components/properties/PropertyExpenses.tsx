import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import type { Property, PropertyExpenseTemplate } from '../../store/propertiesSlice';
import {
  fetchPropertyExpenses,
  updatePropertyExpenses,
} from '../../store/propertiesSlice';

interface PropertyExpensesProps {
  property: Property;
}

export const PropertyExpenses: React.FC<PropertyExpensesProps> = ({ property }) => {
  const dispatch = useAppDispatch();
  const { expenses, loading, error } = useAppSelector((state) => state.properties);

  const [formData, setFormData] = useState<Partial<PropertyExpenseTemplate>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    dispatch(fetchPropertyExpenses(property.id));
  }, [dispatch, property.id]);

  useEffect(() => {
    if (expenses) {
      setFormData(expenses);
    }
  }, [expenses]);

  const handleChange = (field: keyof PropertyExpenseTemplate, value: number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updatePropertyExpenses({ propertyId: property.id, data: formData })
      ).unwrap();
      setHasChanges(false);
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const calculateTotal = () => {
    const fields: (keyof PropertyExpenseTemplate)[] = [
      'propertyManagementFee',
      'accountingLegalFees',
      'repairsMaintenance',
      'pestControl',
      'realEstateTaxes',
      'propertyInsurance',
      'hoaFees',
      'waterSewer',
      'gasElectricity',
      'garbage',
      'cablePhoneInternet',
      'advertising',
    ];

    return fields.reduce((sum, field) => {
      const value = formData[field];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading && !expenses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const ExpenseField = ({
    label,
    field,
    helperText,
  }: {
    label: string;
    field: keyof PropertyExpenseTemplate;
    helperText?: string;
  }) => (
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={label}
        type="number"
        value={formData[field] || ''}
        onChange={(e) => handleChange(field, parseFloat(e.target.value) || undefined)}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        inputProps={{ step: 0.01, min: 0 }}
        helperText={helperText}
      />
    </Grid>
  );

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Monthly Operating Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges || loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Management & Professional Services */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Management & Professional Services
          </Typography>
        </Grid>

        <ExpenseField
          label="Property Management Fee"
          field="propertyManagementFee"
          helperText="Monthly management fee"
        />

        <ExpenseField
          label="Accounting/Legal Fees"
          field="accountingLegalFees"
          helperText="Professional services"
        />

        {/* Property Maintenance */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Property Maintenance
          </Typography>
        </Grid>

        <ExpenseField
          label="Repairs & Maintenance"
          field="repairsMaintenance"
          helperText="Ongoing repairs"
        />

        <ExpenseField
          label="Pest Control"
          field="pestControl"
          helperText="Pest management services"
        />

        {/* Taxes & Insurance */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Taxes & Insurance
          </Typography>
        </Grid>

        <ExpenseField
          label="Real Estate Taxes"
          field="realEstateTaxes"
          helperText="Monthly property tax"
        />

        <ExpenseField
          label="Property Insurance"
          field="propertyInsurance"
          helperText="Monthly insurance premium"
        />

        <ExpenseField
          label="HOA Fees"
          field="hoaFees"
          helperText="Homeowners association"
        />

        {/* Utilities */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Utilities (if landlord pays)
          </Typography>
        </Grid>

        <ExpenseField
          label="Water/Sewer"
          field="waterSewer"
        />

        <ExpenseField
          label="Gas/Electricity"
          field="gasElectricity"
        />

        <ExpenseField
          label="Garbage"
          field="garbage"
        />

        <ExpenseField
          label="Cable/Phone/Internet"
          field="cablePhoneInternet"
        />

        {/* Marketing */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Marketing
          </Typography>
        </Grid>

        <ExpenseField
          label="Advertising"
          field="advertising"
          helperText="Marketing and tenant acquisition"
        />
      </Grid>

      {/* Total Section */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Total Monthly Expenses
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {formatCurrency(calculateTotal())}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          This does not include mortgage payments. Mortgage is accounted for separately in cash flow calculations.
        </Typography>
      </Paper>

      {hasChanges && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You have unsaved changes. Click "Save Changes" to update the expenses.
        </Alert>
      )}
    </Box>
  );
};
