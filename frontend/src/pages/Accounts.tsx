import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  clearError,
  type Account,
} from '../store/accountsSlice';
import { PageContainer } from '../components';
import { FeedbackButton } from '../components/common/FeedbackButton';

const TAX_TREATMENTS = [
  { value: 'TAXABLE', label: 'Taxable' },
  { value: 'TAX_DEFERRED', label: 'Tax-Deferred' },
  { value: 'TAX_EXEMPT', label: 'Tax-Exempt' },
];

interface AccountFormData {
  accountType: string;
  accountName: string;
  institution: string;
  accountNumber: string;
  taxTreatment: 'TAXABLE' | 'TAX_DEFERRED' | 'TAX_EXEMPT';
  owner: string;
}

const initialFormData: AccountFormData = {
  accountType: '',
  accountName: '',
  institution: '',
  accountNumber: '',
  taxTreatment: 'TAXABLE',
  owner: '',
};

export const Accounts = () => {
  const dispatch = useAppDispatch();
  const { accounts, loading, error } = useAppSelector((state) => state.accounts);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        accountType: account.accountType,
        accountName: account.accountName,
        institution: account.institution || '',
        accountNumber: account.accountNumber || '',
        taxTreatment: account.taxTreatment,
        owner: account.owner || '',
      });
    } else {
      setEditingAccount(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
    setFormData(initialFormData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAccount) {
      await dispatch(updateAccount({ id: editingAccount.id, data: formData }));
    } else {
      await dispatch(createAccount(formData));
    }

    handleCloseDialog();
    dispatch(fetchAccounts());
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      await dispatch(deleteAccount(accountToDelete.id));
      setDeleteConfirmOpen(false);
      setAccountToDelete(null);
      dispatch(fetchAccounts());
    }
  };

  const getTaxTreatmentLabel = (value: string) => {
    const treatment = TAX_TREATMENTS.find((t) => t.value === value);
    return treatment?.label || value;
  };

  const getTaxTreatmentColor = (value: string) => {
    switch (value) {
      case 'TAX_EXEMPT':
        return 'success';
      case 'TAX_DEFERRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const calculateAccountValue = (account: Account) => {
    if (!account.positions || account.positions.length === 0) return 0;
    return account.positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  };

  if (loading && accounts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your investment accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Account Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Institution</strong></TableCell>
              <TableCell><strong>Tax Treatment</strong></TableCell>
              <TableCell align="right"><strong>Value</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" py={4}>
                    No accounts found. Click "Add Account" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {account.accountName}
                    </Typography>
                    {account.accountNumber && (
                      <Typography variant="caption" color="text.secondary">
                        {account.accountNumber}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell>{account.institution || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTaxTreatmentLabel(account.taxTreatment)}
                      size="small"
                      color={getTaxTreatmentColor(account.taxTreatment) as any}
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${calculateAccountValue(account).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(account)}
                      title="Edit account"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(account)}
                      title="Delete account"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Account Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingAccount ? 'Edit Account' : 'Create New Account'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                name="accountName"
                label="Account Name"
                value={formData.accountName}
                onChange={handleChange}
                required
                fullWidth
                autoFocus
              />
              <TextField
                name="accountType"
                label="Account Type"
                value={formData.accountType}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Brokerage, 401(k), IRA"
              />
              <TextField
                name="institution"
                label="Institution"
                value={formData.institution}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., Vanguard, Fidelity"
              />
              <TextField
                name="accountNumber"
                label="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
                fullWidth
                placeholder="Last 4 digits or full number"
              />
              <TextField
                name="taxTreatment"
                label="Tax Treatment"
                value={formData.taxTreatment}
                onChange={handleChange}
                select
                required
                fullWidth
              >
                {TAX_TREATMENTS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="owner"
                label="Owner"
                value={formData.owner}
                onChange={handleChange}
                fullWidth
                placeholder="Account owner name"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the account "{accountToDelete?.accountName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Button */}
      <FeedbackButton page="Accounts" />
    </PageContainer>
  );
};
