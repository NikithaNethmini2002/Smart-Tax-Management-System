import React, { useState, useEffect, useCallback } from 'react';
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
  CardContent,
  TablePagination
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
  AccountBalance as AccountBalanceIcon,
  Download as DownloadIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import UserLayout from '../../../components/UserLayout';
import TransactionService from '../../../services/transaction.service';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

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

  // Get unique categories for filter dropdown
  const categories = [...new Set(transactions.map(t => t.category))].sort();

  // Handle sort column click
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle download as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.text('Transaction History', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 30);
    
    // Create filtered data for the table
    const tableData = transactions.map(t => [
      format(new Date(t.date), 'MMM dd, yyyy'),
      t.category,
      t.type === 'income' ? 'Income' : 'Expense',
      t.type === 'income' ? `$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`,
      t.description || '-',
      t.paymentMethod || '-'
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [['Date', 'Category', 'Type', 'Amount', 'Description', 'Payment Method']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 133, 244], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        3: { halign: 'right' }, // Right align the amount column
      }
    });
    
    // Add summary information
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = income - expenses;
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Income: $${income.toFixed(2)}`, 14, finalY);
    doc.text(`Total Expenses: $${expenses.toFixed(2)}`, 14, finalY + 7);
    doc.text(`Balance: $${balance.toFixed(2)}`, 14, finalY + 14);
    
    // Apply filters text if any
    if (searchTerm || categoryFilter || typeFilter) {
      doc.setFontSize(10);
      let filterText = 'Filters applied: ';
      if (searchTerm) filterText += `Search: "${searchTerm}" `;
      if (categoryFilter) filterText += `Category: ${categoryFilter} `;
      if (typeFilter) filterText += `Type: ${typeFilter === 'income' ? 'Income' : 'Expense'} `;
      
      doc.text(filterText, 14, finalY + 25);
    }
    
    // Save the PDF
    doc.save('transactions.pdf');
  };

  // Apply filters and sorting
  const applyFiltersAndSort = () => {
    let filtered = [...transactions];

    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        (t.description && t.description.toLowerCase().includes(search)) ||
        (t.category && t.category.toLowerCase().includes(search)) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(search))
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'amount') {
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortBy === 'category') {
        return sortDirection === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
      return 0;
    });

    return filtered;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTransactions = applyFiltersAndSort();
  const displayedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ mr: 2 }}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
            <Button
              component={RouterLink}
              to="/transactions/new"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Add Transaction
            </Button>
          </Box>
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                margin="normal"
                disabled={!typeFilter}
              >
                <MenuItem value="">All</MenuItem>
                {typeFilter === 'expense' && 
                  expenseCategories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))
                }
                {typeFilter === 'income' && 
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by description, category..."
                InputProps={{
                  endAdornment: <SearchIcon color="action" />
                }}
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
        ) : filteredTransactions.length === 0 ? (
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
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort('date')}
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Date
                        {sortBy === 'date' && (
                          sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('category')}
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Category
                        {sortBy === 'category' && (
                          sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell 
                      onClick={() => handleSort('amount')}
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Amount
                        {sortBy === 'amount' && (
                          sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.type === 'income' ? 'Income' : 'Expense'} 
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          color: transaction.type === 'income' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.paymentMethod || '-'}</TableCell>
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTransactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
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