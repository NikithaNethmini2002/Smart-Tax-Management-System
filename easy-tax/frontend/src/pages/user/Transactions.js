import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  FormHelperText,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Search,
  Add,
  Edit,
  Delete,
  FilterList,
  Clear,
  AttachMoney,
  LocalAtm,
  Label
} from '@mui/icons-material';
import UserLayout from '../../components/UserLayout';
import axios from 'axios';
import { API_URL } from '../../config';
import { formatCurrency, formatDate } from '../../utils/format';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';

const transactionValidationSchema = Yup.object().shape({
  type: Yup.string().required('Type is required'),
  amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
  category: Yup.string().required('Category is required'),
  date: Yup.date().required('Date is required'),
  description: Yup.string(),
  tags: Yup.array().of(Yup.string()),
  paymentMethod: Yup.string()
});

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    icon: 'default-icon',
    color: '#6c757d'
  });

  // Fetch transactions
  const fetchTransactions = async (page = 0, filters = {}) => {
    try {
      setLoading(true);
      
      let queryParams = new URLSearchParams({
        page: page,
        limit: rowsPerPage,
        ...filters
      });
      
      if (searchText) {
        queryParams.append('search', searchText);
      }
      
      const response = await axios.get(`${API_URL}/api/finance/transactions?${queryParams}`);
      
      setTransactions(response.data.transactions);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setNotification({
        open: true,
        message: 'Failed to load transactions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/finance/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setNotification({
        open: true,
        message: 'Failed to load categories',
        severity: 'error'
      });
    }
  };

  // Fetch available tags
  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/finance/transactions/analytics/tags`);
      setAvailableTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchTransactions();
  }, []);

  // Fetch transactions when page, filters or search changes
  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, filters, searchText]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle dialog open for new transaction
  const handleNewTransaction = () => {
    setCurrentTransaction(null);
    setOpenDialog(true);
  };

  // Handle dialog open for edit transaction
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setOpenDialog(true);
  };

  // Handle dialog open for delete transaction
  const handleDeleteClick = (transaction) => {
    setCurrentTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async () => {
    try {
      await axios.delete(`${API_URL}/api/finance/transactions/${currentTransaction._id}`);
      
      setNotification({
        open: true,
        message: 'Transaction deleted successfully',
        severity: 'success'
      });
      
      setOpenDeleteDialog(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setNotification({
        open: true,
        message: 'Failed to delete transaction',
        severity: 'error'
      });
    }
  };

  // Handle form submission (create/update transaction)
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (currentTransaction) {
        // Update transaction
        await axios.put(`${API_URL}/api/finance/transactions/${currentTransaction._id}`, values);
        setNotification({
          open: true,
          message: 'Transaction updated successfully',
          severity: 'success'
        });
      } else {
        // Create transaction
        await axios.post(`${API_URL}/api/finance/transactions`, values);
        setNotification({
          open: true,
          message: 'Transaction created successfully',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      resetForm();
      fetchTransactions();
      fetchTags(); // Refresh tags list
    } catch (error) {
      console.error('Error saving transaction:', error);
      setNotification({
        open: true,
        message: 'Failed to save transaction',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0); // Reset to first page when searching
    }
  };

  // Apply filters
  const applyFilters = () => {
    setPage(0); // Reset to first page when applying filters
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: '',
      category: '',
      startDate: null,
      endDate: null,
      minAmount: '',
      maxAmount: '',
      tags: []
    });
    setSearchText('');
    setPage(0);
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // New function to handle adding a custom category
  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) {
        setNotification({
          open: true,
          message: 'Category name is required',
          severity: 'error'
        });
        return;
      }

      const response = await axios.post(`${API_URL}/api/finance/categories`, newCategory);
      
      setCategories([...categories, response.data]);
      setNewCategoryDialog(false);
      setNewCategory({
        name: '',
        type: 'expense',
        icon: 'default-icon',
        color: '#6c757d'
      });
      
      setNotification({
        open: true,
        message: 'Category added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding category:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to add category',
        severity: 'error'
      });
    }
  };

  // Handle adding a new tag to a transaction form
  const handleAddTag = (values, setFieldValue) => {
    if (newTag && newTag.trim() !== '') {
      const updatedTags = [...values.tags, newTag.trim()];
      setFieldValue('tags', updatedTags);
      setNewTag('');
    }
  };

  // Handle removing a tag from a transaction form
  const handleDeleteTag = (tagToDelete, values, setFieldValue) => {
    const updatedTags = values.tags.filter(tag => tag !== tagToDelete);
    setFieldValue('tags', updatedTags);
  };

  // Add this to your existing events
  const handleCategoryChange = (e, setFieldValue) => {
    const value = e.target.value;
    
    if (value === "__new__") {
      // Open the new category dialog
      setNewCategoryDialog(true);
      // Don't update the field value yet
    } else {
      // Normal category selection
      setFieldValue('category', value);
    }
  };

  // Make sure this category selection logic is in your form
  const getCategoryOptions = (type) => {
    return categories.filter(cat => 
      cat.type === type || cat.type === 'both'
    );
  };

  return (
    <UserLayout title="Transactions">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Transactions</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleNewTransaction}
          >
            Add Transaction
          </Button>
        </Box>

        {/* Search and Filter Bar */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search transactions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchText && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchText('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item>
              <Button
                variant={showFilters ? "contained" : "outlined"}
                color="primary"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
            {filters.type || filters.category || filters.startDate || filters.endDate || 
             filters.minAmount || filters.maxAmount || filters.tags.length > 0 ? (
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              </Grid>
            ) : null}
          </Grid>

          {/* Filter Panel */}
          {showFilters && (
            <Card sx={{ mt: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      label="Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories
                        .filter(cat => !filters.type || cat.type === filters.type || cat.type === 'both')
                        .map(category => (
                          <MenuItem key={category._id} value={category._id}>
                            {category.name}
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={(date) => setFilters({...filters, startDate: date})}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={filters.endDate}
                      onChange={(date) => setFilters({...filters, endDate: date})}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Min Amount"
                    type="number"
                    variant="outlined"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Max Amount"
                    type="number"
                    variant="outlined"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Tags</InputLabel>
                    <Select
                      multiple
                      value={filters.tags}
                      onChange={(e) => setFilters({...filters, tags: e.target.value})}
                      label="Tags"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {availableTags.map((tag) => (
                        <MenuItem key={tag} value={tag}>
                          {tag}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </Card>
          )}
        </Box>

        {/* Transactions Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      {transaction.type === 'income' ? (
                        <Chip 
                          icon={<AttachMoney />} 
                          label="Income" 
                          color="success" 
                          size="small"
                        />
                      ) : (
                        <Chip 
                          icon={<LocalAtm />} 
                          label="Expense" 
                          color="error" 
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <Chip 
                          label={transaction.category.name}
                          size="small"
                          style={{ 
                            backgroundColor: transaction.category.color,
                            color: 'white'
                          }}
                        />
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{transaction.description || 'N/A'}</TableCell>
                    <TableCell>
                      {transaction.tags && transaction.tags.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {transaction.tags.map((tag) => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              size="small" 
                              icon={<Label />}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      ) : 'None'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(transaction)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Add/Edit Transaction Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <Formik
            initialValues={
              currentTransaction ? {
                ...currentTransaction,
                category: currentTransaction.category._id,
                date: new Date(currentTransaction.date)
              } : {
                type: 'expense',
                amount: '',
                category: '',
                date: new Date(),
                description: '',
                tags: [],
                paymentMethod: ''
              }
            }
            validationSchema={transactionValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ 
              values, 
              errors, 
              touched, 
              handleChange, 
              handleBlur, 
              isSubmitting, 
              setFieldValue 
            }) => (
              <Form>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={touched.type && Boolean(errors.type)}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          name="type"
                          value={values.type}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="Type"
                        >
                          <MenuItem value="income">Income</MenuItem>
                          <MenuItem value="expense">Expense</MenuItem>
                        </Select>
                        {touched.type && errors.type && (
                          <FormHelperText>{errors.type}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="amount"
                        label="Amount"
                        type="number"
                        value={values.amount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.amount && Boolean(errors.amount)}
                        helperText={touched.amount && errors.amount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={touched.category && Boolean(errors.category)}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          id="category"
                          name="category"
                          value={values.category}
                          onChange={(e) => handleCategoryChange(e, setFieldValue)}
                          label="Category"
                        >
                          {getCategoryOptions(values.type).map((category) => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))}
                          <MenuItem value="__new__" sx={{ fontStyle: 'italic' }}>
                            + Add new category
                          </MenuItem>
                        </Select>
                        {touched.category && errors.category && (
                          <FormHelperText>{errors.category}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Date"
                          value={values.date}
                          onChange={(date) => setFieldValue('date', date)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={touched.date && Boolean(errors.date)}
                              helperText={touched.date && errors.date}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="paymentMethod"
                        label="Payment Method"
                        value={values.paymentMethod}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.paymentMethod && Boolean(errors.paymentMethod)}
                        helperText={touched.paymentMethod && errors.paymentMethod}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {values.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            onDelete={() => handleDeleteTag(tag, values, setFieldValue)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag(values, setFieldValue);
                            }
                          }}
                          size="small"
                        />
                        <Button 
                          variant="contained" 
                          onClick={() => handleAddTag(values, setFieldValue)}
                          startIcon={<Add />}
                        >
                          Add
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteTransaction} 
              color="error" 
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Category Dialog */}
        <Dialog
          open={newCategoryDialog}
          onClose={() => setNewCategoryDialog(false)}
        >
          <DialogTitle>Add New Category</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
                    label="Type"
                  >
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Color (Hex)"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box 
                          sx={{ 
                            width: 20, 
                            height: 20, 
                            backgroundColor: newCategory.color,
                            borderRadius: '50%'
                          }} 
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewCategoryDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCategory} 
              variant="contained" 
              color="primary"
            >
              Add Category
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleNotificationClose} 
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </UserLayout>
  );
};

export default Transactions; 