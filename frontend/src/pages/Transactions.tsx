import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  fetchTransactions,
  fetchTransactionStats,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
  type TransactionType,
} from '../store/transactionsSlice';
import { fetchAccounts } from '../store/accountsSlice';
import { fetchPositions } from '../store/positionsSlice';
import { fetchProperties } from '../store/propertiesSlice';
import { PageContainer } from '../components';
import { FeedbackButton } from '../components/common/FeedbackButton';

const TRANSACTION_TYPES: { value: TransactionType; label: string; color: string }[] = [
  { value: 'BUY', label: 'Buy', color: 'success' },
  { value: 'SELL', label: 'Sell', color: 'warning' },
  { value: 'DIVIDEND', label: 'Dividend', color: 'info' },
  { value: 'DISTRIBUTION', label: 'Distribution', color: 'info' },
  { value: 'REINVESTMENT', label: 'Reinvestment', color: 'primary' },
  { value: 'TRANSFER', label: 'Transfer', color: 'default' },
  { value: 'CORPORATE_ACTION', label: 'Corporate Action', color: 'secondary' },
  { value: 'CONTRIBUTION', label: 'Contribution', color: 'success' },
  { value: 'WITHDRAWAL', label: 'Withdrawal', color: 'error' },
  { value: 'EXPENSE', label: 'Expense', color: 'error' },
  { value: 'INCOME', label: 'Income', color: 'success' },
];

export const Transactions = () => {
  const dispatch = useAppDispatch();
  const { transactions, stats, loading, error } = useAppSelector((state) => state.transactions);
  const { accounts } = useAppSelector((state) => state.accounts);
  const { positions } = useAppSelector((state) => state.positions);
  const { properties } = useAppSelector((state) => state.properties);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    accountId: '',
    positionId: '',
    transactionType: 'BUY' as TransactionType,
    transactionDate: new Date().toISOString().split('T')[0],
    settlementDate: '',
    shares: '',
    pricePerShare: '',
    totalAmount: '',
    fees: '0',
    description: '',
    // Property-specific fields
    propertyId: '',
    payee: '',
    farmPayeeType: '',
    rentalPayeeType: '',
    revenue: '',
    // Investment-specific fields
    fund: '',
    changeInCapital: '',
    distributions: '',
    hsaCapitalChanges: '',
  });

  const [filterAccount, setFilterAccount] = useState<string>('');
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchTransactionStats());
    dispatch(fetchAccounts());
    dispatch(fetchPositions());
    dispatch(fetchProperties());
  }, [dispatch]);

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        accountId: transaction.accountId,
        positionId: transaction.positionId || '',
        transactionType: transaction.transactionType,
        transactionDate: transaction.transactionDate.split('T')[0],
        settlementDate: transaction.settlementDate ? transaction.settlementDate.split('T')[0] : '',
        shares: transaction.shares?.toString() || '',
        pricePerShare: transaction.pricePerShare?.toString() || '',
        totalAmount: transaction.totalAmount.toString(),
        fees: transaction.fees.toString(),
        description: transaction.description || '',
        // Property-specific fields
        propertyId: transaction.propertyId || '',
        payee: transaction.payee || '',
        farmPayeeType: transaction.farmPayeeType || '',
        rentalPayeeType: transaction.rentalPayeeType || '',
        revenue: transaction.revenue?.toString() || '',
        // Investment-specific fields
        fund: transaction.fund || '',
        changeInCapital: transaction.changeInCapital?.toString() || '',
        distributions: transaction.distributions?.toString() || '',
        hsaCapitalChanges: transaction.hsaCapitalChanges?.toString() || '',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        accountId: '',
        positionId: '',
        transactionType: 'BUY',
        transactionDate: new Date().toISOString().split('T')[0],
        settlementDate: '',
        shares: '',
        pricePerShare: '',
        totalAmount: '',
        fees: '0',
        description: '',
        // Property-specific fields
        propertyId: '',
        payee: '',
        farmPayeeType: '',
        rentalPayeeType: '',
        revenue: '',
        // Investment-specific fields
        fund: '',
        changeInCapital: '',
        distributions: '',
        hsaCapitalChanges: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async () => {
    const data = {
      accountId: formData.accountId,
      positionId: formData.positionId || undefined,
      transactionType: formData.transactionType,
      transactionDate: new Date(formData.transactionDate).toISOString(),
      settlementDate: formData.settlementDate ? new Date(formData.settlementDate).toISOString() : undefined,
      shares: formData.shares ? parseFloat(formData.shares) : undefined,
      pricePerShare: formData.pricePerShare ? parseFloat(formData.pricePerShare) : undefined,
      totalAmount: parseFloat(formData.totalAmount),
      fees: parseFloat(formData.fees) || 0,
      description: formData.description || undefined,
      // Property-specific fields
      propertyId: formData.propertyId || undefined,
      payee: formData.payee || undefined,
      farmPayeeType: formData.farmPayeeType || undefined,
      rentalPayeeType: formData.rentalPayeeType || undefined,
      revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
      // Investment-specific fields
      fund: formData.fund || undefined,
      changeInCapital: formData.changeInCapital ? parseFloat(formData.changeInCapital) : undefined,
      distributions: formData.distributions ? parseFloat(formData.distributions) : undefined,
      hsaCapitalChanges: formData.hsaCapitalChanges ? parseFloat(formData.hsaCapitalChanges) : undefined,
    };

    if (editingTransaction) {
      await dispatch(updateTransaction({ id: editingTransaction.id, data }));
    } else {
      await dispatch(createTransaction(data));
    }

    // Refresh position data if this was a BUY/SELL transaction
    if (data.positionId && (data.transactionType === 'BUY' || data.transactionType === 'SELL')) {
      dispatch(fetchPositions());
    }

    dispatch(fetchTransactionStats());
    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteTransaction(deleteId));
      dispatch(fetchTransactionStats());
      dispatch(fetchPositions()); // Refresh positions in case they were affected
      setOpenDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeConfig = (type: TransactionType) => {
    return TRANSACTION_TYPES.find((t) => t.value === type) || TRANSACTION_TYPES[0];
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (filterAccount && txn.accountId !== filterAccount) return false;
    if (filterPosition && txn.positionId !== filterPosition) return false;
    if (filterType && txn.transactionType !== filterType) return false;
    return true;
  });

  // Determine if selected account is a property account
  const selectedAccountData = filterAccount
    ? accounts.find(acc => acc.id === filterAccount)
    : null;
  const isPropertyAccount = selectedAccountData && selectedAccountData.properties && selectedAccountData.properties.length > 0;

  // Determine if the account selected in the form is a property account
  const formAccountData = formData.accountId
    ? accounts.find(acc => acc.id === formData.accountId)
    : null;
  const isFormPropertyAccount = formAccountData && formAccountData.properties && formAccountData.properties.length > 0;

  // Calculate if shares/price fields should be shown based on transaction type
  const showSharesFields = ['BUY', 'SELL', 'REINVESTMENT'].includes(formData.transactionType);

  return (
    <PageContainer>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Transaction
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h4">{stats.totalTransactions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Inflows
                </Typography>
                <Typography variant="h4" color="success.main">
                  <TrendingUpIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {formatCurrency(stats.totalInflows)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Outflows
                </Typography>
                <Typography variant="h4" color="error.main">
                  <TrendingDownIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {formatCurrency(stats.totalOutflows)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Net Flow
                </Typography>
                <Typography
                  variant="h4"
                  color={stats.netFlow >= 0 ? 'success.main' : 'error.main'}
                >
                  <SwapIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {formatCurrency(stats.netFlow)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Account</InputLabel>
              <Select
                value={filterAccount}
                label="Filter by Account"
                onChange={(e) => setFilterAccount(e.target.value)}
              >
                <MenuItem value="">All Accounts</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Position</InputLabel>
              <Select
                value={filterPosition}
                label="Filter by Position"
                onChange={(e) => setFilterPosition(e.target.value)}
              >
                <MenuItem value="">All Positions</MenuItem>
                {positions.map((position) => (
                  <MenuItem key={position.id} value={position.id}>
                    {position.name} {position.symbol && `(${position.symbol})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {TRANSACTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Account</TableCell>
                {!isPropertyAccount ? (
                  <>
                    {/* Standard Investment Account Columns */}
                    <TableCell>Fund</TableCell>
                    <TableCell align="right">Change in Capital</TableCell>
                    <TableCell align="right">Distributions</TableCell>
                    <TableCell align="right">HSA Capital Changes</TableCell>
                    <TableCell align="right">Shares</TableCell>
                  </>
                ) : (
                  <>
                    {/* Property Account Columns */}
                    <TableCell>Property</TableCell>
                    <TableCell>Payee</TableCell>
                    <TableCell>Farm Payee Type</TableCell>
                    <TableCell>Rental Payee Type</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </>
                )}
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell>{transaction.account?.accountName || '-'}</TableCell>
                      {!isPropertyAccount ? (
                        <>
                          {/* Standard Investment Account Columns */}
                          <TableCell>
                            {transaction.position ? (
                              <>
                                {transaction.position.name}
                                {transaction.position.symbol && ` (${transaction.position.symbol})`}
                              </>
                            ) : (
                              transaction.fund || '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {transaction.changeInCapital !== undefined
                              ? formatCurrency(transaction.changeInCapital)
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {transaction.distributions !== undefined
                              ? formatCurrency(transaction.distributions)
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {transaction.hsaCapitalChanges !== undefined
                              ? formatCurrency(transaction.hsaCapitalChanges)
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {transaction.shares ? transaction.shares.toFixed(2) : '-'}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          {/* Property Account Columns */}
                          <TableCell>
                            {transaction.property
                              ? `${transaction.property.address}, ${transaction.property.city}`
                              : '-'}
                          </TableCell>
                          <TableCell>{transaction.payee || '-'}</TableCell>
                          <TableCell>{transaction.farmPayeeType || '-'}</TableCell>
                          <TableCell>{transaction.rentalPayeeType || '-'}</TableCell>
                          <TableCell align="right">
                            {transaction.revenue !== undefined
                              ? formatCurrency(transaction.revenue)
                              : '-'}
                          </TableCell>
                        </>
                      )}
                      <TableCell align="right">{formatCurrency(transaction.totalAmount)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(transaction)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteId(transaction.id);
                            setOpenDeleteDialog(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Account</InputLabel>
                <Select
                  value={formData.accountId}
                  label="Account"
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={formData.transactionType}
                  label="Transaction Type"
                  onChange={(e) =>
                    setFormData({ ...formData, transactionType: e.target.value as TransactionType })
                  }
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Transaction Date"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Settlement Date"
                type="date"
                value={formData.settlementDate}
                onChange={(e) => setFormData({ ...formData, settlementDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {showSharesFields && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Position (Optional)</InputLabel>
                    <Select
                      value={formData.positionId}
                      label="Position (Optional)"
                      onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {positions
                        .filter((p) => p.accountId === formData.accountId)
                        .map((position) => (
                          <MenuItem key={position.id} value={position.id}>
                            {position.name} {position.symbol && `(${position.symbol})`}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Shares"
                    type="number"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Price per Share"
                    type="number"
                    value={formData.pricePerShare}
                    onChange={(e) => setFormData({ ...formData, pricePerShare: e.target.value })}
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="Total Amount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                </Grid>
              </>
            )}
            {!showSharesFields && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Total Amount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fees"
                type="number"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            {/* Property-specific fields */}
            {isFormPropertyAccount && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Property Transaction Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Property</InputLabel>
                    <Select
                      value={formData.propertyId}
                      label="Property"
                      onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {properties
                        .filter((p) => p.accountId === formData.accountId)
                        .map((property) => (
                          <MenuItem key={property.id} value={property.id}>
                            {property.address} - {property.city}, {property.state}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payee"
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Farm Payee Type"
                    value={formData.farmPayeeType}
                    onChange={(e) => setFormData({ ...formData, farmPayeeType: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Rental Payee Type"
                    value={formData.rentalPayeeType}
                    onChange={(e) => setFormData({ ...formData, rentalPayeeType: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Revenue"
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
              </>
            )}

            {/* Investment-specific fields */}
            {!isFormPropertyAccount && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Investment Transaction Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fund"
                    value={formData.fund}
                    onChange={(e) => setFormData({ ...formData, fund: e.target.value })}
                    helperText="Investment fund or position name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Change in Capital"
                    type="number"
                    value={formData.changeInCapital}
                    onChange={(e) => setFormData({ ...formData, changeInCapital: e.target.value })}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Distributions"
                    type="number"
                    value={formData.distributions}
                    onChange={(e) => setFormData({ ...formData, distributions: e.target.value })}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="HSA Capital Changes"
                    type="number"
                    value={formData.hsaCapitalChanges}
                    onChange={(e) => setFormData({ ...formData, hsaCapitalChanges: e.target.value })}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.accountId || !formData.totalAmount}>
            {editingTransaction ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this transaction? If this transaction affected a position,
          the position values will be recalculated.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Button */}
      <FeedbackButton page="Transactions" />
    </PageContainer>
  );
};
