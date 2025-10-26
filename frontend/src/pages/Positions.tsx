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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPositions,
  fetchInvestmentTypes,
  createPosition,
  updatePosition,
  deletePosition,
  clearError,
  type Position,
} from '../store/positionsSlice';
import { fetchAccounts } from '../store/accountsSlice';
import { PageContainer } from '../components';
import { FeedbackButton } from '../components/common/FeedbackButton';

interface PositionFormData {
  accountId: string;
  investmentTypeId: string;
  symbol: string;
  name: string;
  shares: string;
  costBasisTotal: string;
  currentPrice: string;
}

const initialFormData: PositionFormData = {
  accountId: '',
  investmentTypeId: '',
  symbol: '',
  name: '',
  shares: '',
  costBasisTotal: '',
  currentPrice: '',
};

export const Positions = () => {
  const dispatch = useAppDispatch();
  const { positions, investmentTypes, loading, error } = useAppSelector((state) => state.positions);
  const { accounts } = useAppSelector((state) => state.accounts);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<PositionFormData>(initialFormData);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  useEffect(() => {
    dispatch(fetchPositions());
    dispatch(fetchInvestmentTypes());
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

  const handleOpenDialog = (position?: Position) => {
    if (position) {
      setEditingPosition(position);
      setFormData({
        accountId: position.accountId,
        investmentTypeId: position.investmentTypeId,
        symbol: position.symbol || '',
        name: position.name,
        shares: position.shares.toString(),
        costBasisTotal: position.costBasisTotal.toString(),
        currentPrice: position.currentPrice.toString(),
      });
    } else {
      setEditingPosition(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPosition(null);
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

    const data = {
      accountId: formData.accountId,
      investmentTypeId: formData.investmentTypeId,
      symbol: formData.symbol || undefined,
      name: formData.name,
      shares: parseFloat(formData.shares),
      costBasisTotal: parseFloat(formData.costBasisTotal),
      currentPrice: parseFloat(formData.currentPrice),
    };

    if (editingPosition) {
      await dispatch(updatePosition({ id: editingPosition.id, data }));
    } else {
      await dispatch(createPosition(data));
    }

    handleCloseDialog();
    dispatch(fetchPositions());
  };

  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (positionToDelete) {
      await dispatch(deletePosition(positionToDelete.id));
      setDeleteConfirmOpen(false);
      setPositionToDelete(null);
      dispatch(fetchPositions());
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (gainLoss: number, costBasis: number) => {
    if (costBasis === 0) return '0.00%';
    const percent = (gainLoss / costBasis) * 100;
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getGainLossColor = (value: number) => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.secondary';
  };

  if (loading && positions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasisTotal, 0);
  const totalGainLoss = totalValue - totalCostBasis;

  return (
    <PageContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Positions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your investment positions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Position
        </Button>
      </Box>

      {/* Portfolio Summary */}
      <Box display="flex" gap={2} mb={2}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Value
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatCurrency(totalValue)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Gain/Loss
          </Typography>
          <Typography
            variant="h5"
            fontWeight="bold"
            color={getGainLossColor(totalGainLoss)}
            display="flex"
            alignItems="center"
            gap={0.5}
          >
            {totalGainLoss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            {formatCurrency(Math.abs(totalGainLoss))}
            <Typography variant="body2" component="span">
              ({formatPercent(totalGainLoss, totalCostBasis)})
            </Typography>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Positions
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {positions.length}
          </Typography>
        </Paper>
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
              <TableCell><strong>Symbol</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Account</strong></TableCell>
              <TableCell align="right"><strong>Shares</strong></TableCell>
              <TableCell align="right"><strong>Cost Basis</strong></TableCell>
              <TableCell align="right"><strong>Price</strong></TableCell>
              <TableCell align="right"><strong>Value</strong></TableCell>
              <TableCell align="right"><strong>Gain/Loss</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" py={4}>
                    No positions found. Click "Add Position" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              positions.map((position) => (
                <TableRow key={position.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {position.symbol || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{position.name}</Typography>
                    {position.investmentType && (
                      <Chip
                        label={position.investmentType.name}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {position.account?.accountName || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {position.shares.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(position.costBasisTotal)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(position.currentPrice)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="medium">
                      {formatCurrency(position.currentValue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={getGainLossColor(position.unrealizedGainLoss)}
                      fontWeight="medium"
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      gap={0.5}
                    >
                      {position.unrealizedGainLoss >= 0 ? (
                        <TrendingUpIcon fontSize="small" />
                      ) : (
                        <TrendingDownIcon fontSize="small" />
                      )}
                      {formatCurrency(Math.abs(position.unrealizedGainLoss))}
                      <Typography variant="caption">
                        ({formatPercent(position.unrealizedGainLoss, position.costBasisTotal)})
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(position)}
                      title="Edit position"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(position)}
                      title="Delete position"
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

      {/* Create/Edit Position Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingPosition ? 'Edit Position' : 'Create New Position'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                name="accountId"
                label="Account"
                value={formData.accountId}
                onChange={handleChange}
                select
                required
                fullWidth
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="investmentTypeId"
                label="Investment Type"
                value={formData.investmentTypeId}
                onChange={handleChange}
                select
                required
                fullWidth
              >
                {investmentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name} ({type.category})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="symbol"
                label="Symbol (Optional)"
                value={formData.symbol}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., VTSAX"
              />

              <TextField
                name="name"
                label="Position Name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Vanguard Total Stock Market"
              />

              <TextField
                name="shares"
                label="Number of Shares"
                type="number"
                value={formData.shares}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ step: '0.0001', min: '0' }}
              />

              <TextField
                name="costBasisTotal"
                label="Total Cost Basis ($)"
                type="number"
                value={formData.costBasisTotal}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
              />

              <TextField
                name="currentPrice"
                label="Current Price per Share ($)"
                type="number"
                value={formData.currentPrice}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingPosition ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Position</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the position "{positionToDelete?.name}"?
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
      <FeedbackButton page="Positions" />
    </PageContainer>
  );
};
