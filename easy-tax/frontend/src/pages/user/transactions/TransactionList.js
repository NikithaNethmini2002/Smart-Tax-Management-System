import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import UserLayout from '../../../components/UserLayout';
import TransactionService from '../../../services/transaction.service';
import { format } from 'date-fns';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    maxAmount: '',
    fromDate: '',
    toDate: '',
    tags: ''
  });

  // Categories
  const expenseCategories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Housing',
    'Utilities',
    'Healthcare',
    'Personal Care',
    'Education',
    'Shopping',
    'Travel',
    'Gifts & Donations',
    'Investments',
    'Taxes',
    'Other'
  ];

  const incomeCategories = [
    'Salary',
    'Business',
    'Investments',
    'Gifts',
    'Rental',
    'Refunds',
    'Other'
  ];

  const paymentMethods = [
    'cash',
    'credit card',
    'debit card',
    'bank transfer',
    'other'
  ];

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await TransactionService.getAllTransactions();
      setTransactions(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      console.log('Fetching transaction summary...');
      const summary = await TransactionService.getTransactionSummary('monthly');
      console.log('Summary data received:', summary);
      setSummaryData(summary);
    } catch (err) {
      console.error('Error fetching transaction summary:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      category: '',
      maxAmount: '',
      fromDate: '',
      toDate: '',
      tags: ''
    });
    fetchTransactions();
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      // Remove empty filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const data = await TransactionService.filterTransactions(activeFilters);
      setTransactions(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await TransactionService.deleteTransaction(id);
        setTransactions(transactions.filter(transaction => transaction._id !== id));
        setSuccess('Transaction deleted successfully');
        setOpenSnackbar(true);
      } catch (err) {
        setError(err.message || 'Failed to delete transaction');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  const formatAmount = (amount, type) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <UserLayout title="Transactions">
      {/* Summary Widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Income
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                {summaryData ? (
                  <Typography variant="h4" color="success.main">
                    ${summaryData.income?.toFixed(2) || '0.00'}
                  </Typography>
                ) : (
                  <CircularProgress size={24} />
                )}
              </Box>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expenses
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                {summaryData ? (
                  <Typography variant="h4" color="error.main">
                    ${summaryData.expense?.toFixed(2) || '0.00'}
                  </Typography>
                ) : (
                  <CircularProgress size={24} />
                )}
              </Box>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Balance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                {summaryData ? (
                  <Typography variant="h4" color={(summaryData.income - summaryData.expense) >= 0 ? 'success.main' : 'error.main'}>
                    ${((summaryData.income || 0) - (summaryData.expense || 0)).toFixed(2)}
                  </Typography>
                ) : (
                  <CircularProgress size={24} />
                )}
              </Box>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Transactions</Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/transactions/new"
            startIcon={<AddIcon />}
          >
            Add Transaction
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filters Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Transactions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                margin="normal"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                margin="normal"
                disabled={!filters.type}
              >
                <MenuItem value="">All</MenuItem>
                {filters.type === 'expense' && 
                  expenseCategories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))
                }
                {filters.type === 'income' && 
                  incomeCategories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))
                }
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Amount"
                name="maxAmount"
                type="number"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="From Date"
                name="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={handleFilterChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="To Date"
                name="toDate"
                type="date"
                value={filters.toDate}
                onChange={handleFilterChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                name="tags"
                value={filters.tags}
                onChange={handleFilterChange}
                margin="normal"
                placeholder="e.g., #vacation, #business"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Clear Filters
              </Button>
              <Button 
                variant="contained" 
                onClick={applyFilters}
                startIcon={<SearchIcon />}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No transactions found.</Typography>
            <Button 
              component={RouterLink} 
              to="/transactions/new" 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              Add Your First Transaction
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} 
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell 
                      sx={{ 
                        color: transaction.type === 'income' ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {formatAmount(transaction.amount, transaction.type)}
                    </TableCell>
                    <TableCell>
                      {transaction.tags && transaction.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton 
                          component={RouterLink} 
                          to={`/transactions/${transaction._id}/edit`}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDelete(transaction._id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </UserLayout>
  );
};

export default TransactionList; 