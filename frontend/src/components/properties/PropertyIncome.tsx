import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import type { Property, PropertyIncome as PropertyIncomeType } from '../../store/propertiesSlice';
import {
  fetchPropertyIncome,
  addPropertyIncome,
  updatePropertyIncome,
  deletePropertyIncome,
  PropertyIncomeType as IncomeTypeEnum,
  IncomeFrequency,
} from '../../store/propertiesSlice';

interface PropertyIncomeProps {
  property: Property;
}

interface IncomeFormData {
  incomeType: IncomeTypeEnum;
  amount: number;
  frequency: IncomeFrequency;
  description: string;
  isActive: boolean;
}

export const PropertyIncome: React.FC<PropertyIncomeProps> = ({ property }) => {
  const dispatch = useAppDispatch();
  const { income, loading, error } = useAppSelector((state) => state.properties);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<PropertyIncomeType | null>(null);

  const [formData, setFormData] = useState<IncomeFormData>({
    incomeType: IncomeTypeEnum.RENT,
    amount: 0,
    frequency: IncomeFrequency.MONTHLY,
    description: '',
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchPropertyIncome(property.id));
  }, [dispatch, property.id]);

  const handleOpenForm = (incomeItem?: PropertyIncomeType) => {
    if (incomeItem) {
      setEditingIncome(incomeItem);
      setFormData({
        incomeType: incomeItem.incomeType,
        amount: incomeItem.amount,
        frequency: incomeItem.frequency,
        description: incomeItem.description || '',
        isActive: incomeItem.isActive,
      });
    } else {
      setEditingIncome(null);
      setFormData({
        incomeType: IncomeTypeEnum.RENT,
        amount: 0,
        frequency: IncomeFrequency.MONTHLY,
        description: '',
        isActive: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIncome(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingIncome) {
        await dispatch(
          updatePropertyIncome({
            propertyId: property.id,
            incomeId: editingIncome.id,
            data: formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          addPropertyIncome({
            propertyId: property.id,
            data: formData,
          })
        ).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const handleDelete = async (incomeId: string) => {
    if (!window.confirm('Are you sure you want to delete this income source?')) {
      return;
    }

    try {
      await dispatch(
        deletePropertyIncome({ propertyId: property.id, incomeId })
      ).unwrap();
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateMonthlyAmount = (amount: number, frequency: IncomeFrequency) => {
    switch (frequency) {
      case IncomeFrequency.MONTHLY:
        return amount;
      case IncomeFrequency.QUARTERLY:
        return amount / 3;
      case IncomeFrequency.ANNUALLY:
        return amount / 12;
      case IncomeFrequency.ONE_TIME:
        return 0;
      default:
        return amount;
    }
  };

  const calculateTotalMonthlyIncome = () => {
    return income
      .filter((i) => i.isActive)
      .reduce((sum, i) => sum + calculateMonthlyAmount(i.amount, i.frequency), 0);
  };

  if (loading && income.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Income Sources
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add Income Source
        </Button>
      </Box>

      {income.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No income sources added yet
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Monthly Equivalent</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {income.map((incomeItem) => (
                  <TableRow key={incomeItem.id}>
                    <TableCell>
                      <Chip
                        label={incomeItem.incomeType.replace(/_/g, ' ')}
                        size="small"
                        color={incomeItem.incomeType === IncomeTypeEnum.RENT ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(incomeItem.amount)}</TableCell>
                    <TableCell>
                      {incomeItem.frequency.charAt(0) + incomeItem.frequency.slice(1).toLowerCase()}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(calculateMonthlyAmount(incomeItem.amount, incomeItem.frequency))}
                    </TableCell>
                    <TableCell>{incomeItem.description || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={incomeItem.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={incomeItem.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(incomeItem)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(incomeItem.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total Section */}
          <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Total Monthly Income (Active Only)
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {formatCurrency(calculateTotalMonthlyIncome())}
              </Typography>
            </Box>
          </Paper>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIncome ? 'Edit Income Source' : 'Add Income Source'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              select
              fullWidth
              label="Income Type"
              value={formData.incomeType}
              onChange={(e) =>
                setFormData({ ...formData, incomeType: e.target.value as IncomeTypeEnum })
              }
            >
              {Object.values(IncomeTypeEnum).map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              inputProps={{ step: 0.01, min: 0 }}
            />

            <TextField
              select
              fullWidth
              label="Frequency"
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value as IncomeFrequency })
              }
            >
              {Object.values(IncomeFrequency).map((freq) => (
                <MenuItem key={freq} value={freq}>
                  {freq.charAt(0) + freq.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || formData.amount <= 0}
          >
            {loading ? 'Saving...' : editingIncome ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
