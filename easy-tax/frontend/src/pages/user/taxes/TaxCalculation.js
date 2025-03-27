import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  ArrowUpward, 
  ArrowDownward, 
  InfoOutlined,
  PriorityHighOutlined,
  BusinessCenter,
  AttachMoney,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterAlt,
  CalendarMonth,
  DateRange
} from '@mui/icons-material';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  format, 
  isWithinInterval,
  parseISO,
  subMonths,
  subWeeks,
  getMonth,
  getYear
} from 'date-fns';
import TransactionService from '../../../services/transaction.service';

const TaxCalculation = ({ taxData, onDeleteTax, onEditTax }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [salaryTaxes, setSalaryTaxes] = useState([]);
  const [businessTaxes, setBusinessTaxes] = useState([]);
  const [totalTax, setTotalTax] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState(null);
  
  // Filter states
  const [filterType, setFilterType] = useState('all'); // 'all', 'month', 'week'
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const transactionsData = await TransactionService.getAllTransactions();
        // Only consider income transactions
        const incomeTransactions = transactionsData.filter(tx => tx.type === 'income');
        setTransactions(incomeTransactions);
        setFilteredTransactions(incomeTransactions); // Initially all transactions are shown
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Apply time-based filtering when filter type or dates change
  useEffect(() => {
    applyTimeFilter();
  }, [filterType, selectedMonth, selectedWeek, transactions]);

  // Filter transactions based on selected time period
  const applyTimeFilter = () => {
    if (!transactions.length) return;

    let start, end;
    let filtered;

    switch (filterType) {
      case 'month':
        start = startOfMonth(selectedMonth);
        end = endOfMonth(selectedMonth);
        setDateRange({ start, end });
        break;
      case 'week':
        start = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Week starts on Monday
        end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
        setDateRange({ start, end });
        break;
      case 'all':
      default:
        setDateRange({ start: null, end: null });
        setFilteredTransactions(transactions);
        return;
    }

    // Filter transactions within the date range
    filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return isWithinInterval(txDate, { start, end });
    });

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    // Calculate taxes based on specific transaction descriptions
    if (taxData.length > 0 && filteredTransactions.length > 0) {
      // Get Salary taxes
      const salaryItems = taxData
        .filter(tax => tax.category.toLowerCase().includes('salary'))
        .map(tax => {
          // Find the specific transaction based on subCategory (description)
          const specificTransaction = filteredTransactions.find(
            tx => tx.category === tax.category && tx.description === tax.subCategory
          );
          
          const incomeAmount = specificTransaction ? specificTransaction.amount : 0;
          const taxAmount = (incomeAmount * tax.percentage) / 100;
          
          return {
            ...tax,
            incomeAmount,
            taxAmount,
            transactionDescription: tax.subCategory || 'N/A'
          };
        });
      
      // Get Business taxes
      const businessItems = taxData
        .filter(tax => tax.category.toLowerCase().includes('business'))
        .map(tax => {
          // Find the specific transaction based on subCategory (description)
          const specificTransaction = filteredTransactions.find(
            tx => tx.category === tax.category && tx.description === tax.subCategory
          );
          
          const incomeAmount = specificTransaction ? specificTransaction.amount : 0;
          const taxAmount = (incomeAmount * tax.percentage) / 100;
          
          return {
            ...tax,
            incomeAmount,
            taxAmount,
            transactionDescription: tax.subCategory || 'N/A'
          };
        });
      
      setSalaryTaxes(salaryItems);
      setBusinessTaxes(businessItems);
      
      // Calculate total tax
      const totalSalaryTax = salaryItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const totalBusinessTax = businessItems.reduce((sum, item) => sum + item.taxAmount, 0);
      setTotalTax(totalSalaryTax + totalBusinessTax);
    } else {
      setSalaryTaxes([]);
      setBusinessTaxes([]);
      setTotalTax(0);
    }
  }, [taxData, filteredTransactions]);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleFilterTypeChange = (event, newType) => {
    if (newType !== null) {
      setFilterType(newType);
    }
  };

  const handleMonthChange = (event) => {
    // Parse the month and year from the value
    const [year, month] = event.target.value.split('-');
    const newDate = new Date(parseInt(year), parseInt(month) - 1);
    setSelectedMonth(newDate);
  };

  const handleWeekChange = (date) => {
    setSelectedWeek(date);
  };

  const handleEditClick = (tax) => {
    onEditTax(tax.id);
  };

  const handleDeleteClick = (tax) => {
    setTaxToDelete(tax);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taxToDelete) {
      onDeleteTax(taxToDelete.id);
      setDeleteDialogOpen(false);
      setTaxToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaxToDelete(null);
  };

  // Generate options for month selection dropdown
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Add options for the current month and previous 11 months
    for (let i = 0; i < 12; i++) {
      const date = subMonths(currentDate, i);
      const yearMonth = `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
      options.push({
        value: yearMonth,
        label: format(date, 'MMMM yyyy')
      });
    }
    
    return options;
  };

  // Generate options for week selection dropdown
  const getWeekOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Add options for the current week and previous 11 weeks
    for (let i = 0; i < 12; i++) {
      const date = subWeeks(currentDate, i);
      const startOfTheWeek = startOfWeek(date, { weekStartsOn: 1 });
      const endOfTheWeek = endOfWeek(date, { weekStartsOn: 1 });
      options.push({
        value: format(startOfTheWeek, 'yyyy-MM-dd'),
        label: `${format(startOfTheWeek, 'MMM d')} - ${format(endOfTheWeek, 'MMM d, yyyy')}`
      });
    }
    
    return options;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate totals for each category based on filtered transactions
  const salaryTransactions = filteredTransactions.filter(tx => 
    tx.category.toLowerCase().includes('salary')
  );
  const businessTransactions = filteredTransactions.filter(tx => 
    tx.category.toLowerCase().includes('business')
  );
  
  const totalSalaryIncome = salaryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalBusinessIncome = businessTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = totalSalaryIncome + totalBusinessIncome;

  // Calculate total tax by category
  const totalSalaryTax = salaryTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);
  const totalBusinessTax = businessTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);

  // Format date range for display
  const getDateRangeLabel = () => {
    if (filterType === 'all' || !dateRange.start || !dateRange.end) {
      return 'All Time';
    }
    return `${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
  };

  const monthOptions = getMonthOptions();
  const weekOptions = getWeekOptions();

  return (
    <Box>
      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the tax "{taxToDelete?.title}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {taxData.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ mb: 4 }}
          icon={<PriorityHighOutlined />}
        >
          No taxes have been added yet. Please add taxes in the "Add Tax" tab first.
        </Alert>
      ) : (
        <>
          {/* Time Filter Controls */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              backgroundColor: 'white',
              borderLeft: '4px solid #9c27b0'
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterAlt color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 500 }}>
                  Filter by Time Period
                </Typography>
              </Box>
              
              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={handleFilterTypeChange}
                aria-label="time period filter"
                size="small"
                sx={{ ml: { xs: 0, sm: 'auto' } }}
              >
                <ToggleButton value="all" aria-label="all time">
                  <DateRange fontSize="small" sx={{ mr: 0.5 }} />
                  All Time
                </ToggleButton>
                <ToggleButton value="month" aria-label="month">
                  <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
                  Month
                </ToggleButton>
                <ToggleButton value="week" aria-label="week">
                  <DateRange fontSize="small" sx={{ mr: 0.5 }} />
                  Week
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {filterType !== 'all' && (
              <Box sx={{ mt: 2 }}>
                {filterType === 'month' && (
                  <FormControl fullWidth>
                    <InputLabel id="month-select-label">Select Month</InputLabel>
                    <Select
                      labelId="month-select-label"
                      id="month-select"
                      value={format(selectedMonth, 'yyyy-MM')}
                      label="Select Month"
                      onChange={handleMonthChange}
                    >
                      {monthOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {filterType === 'week' && (
                  <FormControl fullWidth>
                    <InputLabel id="week-select-label">Select Week</InputLabel>
                    <Select
                      labelId="week-select-label"
                      id="week-select"
                      value={format(selectedWeek, 'yyyy-MM-dd')}
                      label="Select Week"
                      onChange={(e) => handleWeekChange(new Date(e.target.value))}
                    >
                      {weekOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Showing tax calculations for:
              </Typography>
              <Chip
                label={getDateRangeLabel()}
                color="secondary"
                variant="outlined"
                size="small"
              />
            </Box>
          </Paper>

          {filteredTransactions.length === 0 ? (
            <Alert 
              severity="info" 
              sx={{ mb: 4 }}
            >
              No transactions found for the selected time period. Please select a different period or add transactions.
            </Alert>
          ) : (
            <>
              {/* Category Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      borderRadius: 2,
                      height: '100%',
                      transition: 'transform 0.2s',
                      borderLeft: '4px solid #1976d2',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <AttachMoney color="primary" />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 500,
                            color: '#1976d2'
                          }}
                        >
                          Salary Tax
                        </Typography>
                      </Stack>
                      
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Income
                            </Typography>
                            <Typography variant="h6" color="success.main" sx={{ fontWeight: 500 }}>
                              {formatCurrency(totalSalaryIncome)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Tax
                            </Typography>
                            <Typography variant="h6" color="error.main" sx={{ fontWeight: 500 }}>
                              {formatCurrency(totalSalaryTax)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      {salaryTaxes.length === 0 ? (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          No salary taxes defined or no matching transactions in this time period
                        </Alert>
                      ) : (
                        <TableContainer sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Tax</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Transaction</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {salaryTaxes.map((tax) => (
                                <TableRow key={tax.id} hover>
                                  <TableCell>{tax.title}</TableCell>
                                  <TableCell>
                                    <Tooltip title="Transaction description">
                                      <Chip 
                                        label={tax.transactionDescription} 
                                        size="small" 
                                        sx={{ 
                                          backgroundColor: '#e3f2fd',
                                          fontWeight: 500,
                                          maxWidth: '150px',
                                          textOverflow: 'ellipsis',
                                          overflow: 'hidden'
                                        }} 
                                      />
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>{tax.percentage}%</TableCell>
                                  <TableCell sx={{ fontWeight: 500, color: '#d32f2f' }}>
                                    {formatCurrency(tax.taxAmount)}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                      <Tooltip title="Edit">
                                        <IconButton 
                                          aria-label="edit" 
                                          size="small" 
                                          color="primary"
                                          onClick={() => handleEditClick(tax)}
                                          sx={{ 
                                            mr: 1,
                                            transition: 'all 0.2s',
                                            '&:hover': { 
                                              transform: 'scale(1.1)',
                                              backgroundColor: 'rgba(25, 118, 210, 0.1)' 
                                            } 
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete">
                                        <IconButton 
                                          aria-label="delete" 
                                          size="small" 
                                          color="error"
                                          onClick={() => handleDeleteClick(tax)}
                                          sx={{ 
                                            transition: 'all 0.2s',
                                            '&:hover': { 
                                              transform: 'scale(1.1)',
                                              backgroundColor: 'rgba(211, 47, 47, 0.1)' 
                                            } 
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      borderRadius: 2,
                      height: '100%',
                      transition: 'transform 0.2s',
                      borderLeft: '4px solid #2e7d32',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <BusinessCenter color="success" />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 500,
                            color: '#2e7d32'
                          }}
                        >
                          Business Tax
                        </Typography>
                      </Stack>
                      
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Income
                            </Typography>
                            <Typography variant="h6" color="success.main" sx={{ fontWeight: 500 }}>
                              {formatCurrency(totalBusinessIncome)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Tax
                            </Typography>
                            <Typography variant="h6" color="error.main" sx={{ fontWeight: 500 }}>
                              {formatCurrency(totalBusinessTax)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      {businessTaxes.length === 0 ? (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          No business taxes defined or no matching transactions in this time period
                        </Alert>
                      ) : (
                        <TableContainer sx={{ mt: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Tax</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Transaction</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {businessTaxes.map((tax) => (
                                <TableRow key={tax.id} hover>
                                  <TableCell>{tax.title}</TableCell>
                                  <TableCell>
                                    <Tooltip title="Transaction description">
                                      <Chip 
                                        label={tax.transactionDescription} 
                                        size="small" 
                                        sx={{ 
                                          backgroundColor: '#e8f5e9',
                                          fontWeight: 500,
                                          maxWidth: '150px',
                                          textOverflow: 'ellipsis',
                                          overflow: 'hidden'
                                        }} 
                                      />
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>{tax.percentage}%</TableCell>
                                  <TableCell sx={{ fontWeight: 500, color: '#d32f2f' }}>
                                    {formatCurrency(tax.taxAmount)}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                      <Tooltip title="Edit">
                                        <IconButton 
                                          aria-label="edit" 
                                          size="small" 
                                          color="primary" 
                                          onClick={() => handleEditClick(tax)}
                                          sx={{ 
                                            mr: 1,
                                            transition: 'all 0.2s',
                                            '&:hover': { 
                                              transform: 'scale(1.1)',
                                              backgroundColor: 'rgba(25, 118, 210, 0.1)' 
                                            } 
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete">
                                        <IconButton 
                                          aria-label="delete" 
                                          size="small" 
                                          color="error" 
                                          onClick={() => handleDeleteClick(tax)}
                                          sx={{ 
                                            transition: 'all 0.2s',
                                            '&:hover': { 
                                              transform: 'scale(1.1)',
                                              backgroundColor: 'rgba(211, 47, 47, 0.1)' 
                                            } 
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Summary Card */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  backgroundColor: 'white',
                  borderTop: '4px solid #d32f2f'
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    mb: 3,
                    fontWeight: 600,
                    color: '#d32f2f'
                  }}
                >
                  Tax Summary {filterType !== 'all' && `(${getDateRangeLabel()})`}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: '#f5f7fa',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">
                          Total Income
                        </Typography>
                        <Typography 
                          variant="h4" 
                          color="success.main"
                          sx={{ fontWeight: 600, mt: 1 }}
                        >
                          {formatCurrency(totalIncome)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: '#f5f7fa',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">
                          Total Tax
                        </Typography>
                        <Typography 
                          variant="h4" 
                          color="error.main"
                          sx={{ fontWeight: 600, mt: 1 }}
                        >
                          {formatCurrency(totalTax)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        borderRadius: 2,
                        backgroundColor: '#f5f7fa',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">
                          After-Tax Income
                        </Typography>
                        <Typography 
                          variant="h4" 
                          color="primary"
                          sx={{ fontWeight: 600, mt: 1 }}
                        >
                          {formatCurrency(totalIncome - totalTax)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default TaxCalculation; 