import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText,
  Chip,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  Warning,
  ShowChart,
  Lightbulb,
  Check
} from '@mui/icons-material';
import UserLayout from '../../components/UserLayout';
import axios from 'axios';
import { API_URL } from '../../config';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/format';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const budgetValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
  period: Yup.string().required('Period is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().when('period', {
    is: 'custom',
    then: Yup.date().required('End date is required for custom period').min(
      Yup.ref('startDate'),
      'End date must be after start date'
    )
  }),
  category: Yup.string(),
  tags: Yup.array().of(Yup.string()),
  notificationThreshold: Yup.number().min(0, 'Must be at least 0').max(1, 'Must be at most 1')
});

const Budgets = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [activeBudgets, setActiveBudgets] = useState([]);
  const [inactiveBudgets, setInactiveBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [availableTags, setAvailableTags] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [openRecommendations, setOpenRecommendations] = useState(false);

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/finance/budgets`);
      
      // Separate active and inactive budgets
      const active = response.data.filter(b => b.isActive);
      const inactive = response.data.filter(b => !b.isActive);
      
      setBudgets(response.data);
      setActiveBudgets(active);
      setInactiveBudgets(inactive);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/finance/categories`);
      // Filter only expense categories or both
      const expenseCategories = response.data.filter(
        cat => cat.type === 'expense' || cat.type === 'both'
      );
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  // Fetch budget recommendations
  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const response = await axios.get(`${API_URL}/api/finance/budgets/recommendations/analysis`);
      setRecommendations(response.data.recommendations);
      setLoadingRecommendations(false);
      
      // If there are recommendations, open the dialog
      if (response.data.recommendations.length > 0) {
        setOpenRecommendations(true);
      } else {
        setNotification({
          open: true,
          message: 'No budget recommendations available at this time',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoadingRecommendations(false);
      setNotification({
        open: true,
        message: 'Failed to fetch budget recommendations',
        severity: 'error'
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchTags();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle dialog open for new budget
  const handleNewBudget = () => {
    setCurrentBudget(null);
    setOpenDialog(true);
  };

  // Handle dialog open for edit budget
  const handleEditBudget = (budget) => {
    setCurrentBudget(budget);
    setOpenDialog(true);
  };

  // Handle dialog open for delete budget
  const handleDeleteClick = (budget) => {
    setCurrentBudget(budget);
    setOpenDeleteDialog(true);
  };

  // Handle delete budget
  const handleDeleteBudget = async () => {
    try {
      await axios.delete(`${API_URL}/api/finance/budgets/${currentBudget._id}`);
      
      setNotification({
        open: true,
        message: 'Budget deleted successfully',
        severity: 'success'
      });
      
      setOpenDeleteDialog(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      setNotification({
        open: true,
        message: 'Failed to delete budget',
        severity: 'error'
      });
    }
  };

  // Handle form submission (create/update budget)
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (currentBudget) {
        // Update budget
        await axios.put(`${API_URL}/api/finance/budgets/${currentBudget._id}`, values);
        setNotification({
          open: true,
          message: 'Budget updated successfully',
          severity: 'success'
        });
      } else {
        // Create budget
        await axios.post(`${API_URL}/api/finance/budgets`, values);
        setNotification({
          open: true,
          message: 'Budget created successfully',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      setNotification({
        open: true,
        message: 'Failed to save budget',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle recommendation application
  const applyRecommendation = (recommendation) => {
    // For new budget
    if (recommendation.type === 'new') {
      setCurrentBudget(null);
      setOpenDialog(true);
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.elements.name.value = `${recommendation.categoryName} Budget`;
          form.elements.amount.value = recommendation.suggestedBudget;
          form.elements.category.value = recommendation.categoryId;
        }
      }, 100);
    } 
    // For update budget
    else {
      const budgetToUpdate = budgets.find(b => 
        b.category && b.category._id === recommendation.categoryId
      );
      if (budgetToUpdate) {
        setCurrentBudget({
          ...budgetToUpdate,
          amount: recommendation.suggestedBudget
        });
        setOpenDialog(true);
      }
    }
    setOpenRecommendations(false);
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Get progress color based on usage percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return theme.palette.error.main;
    if (percentage >= 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <UserLayout title="Budgets">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Budget Management
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<Lightbulb />} 
              onClick={fetchRecommendations}
              disabled={loadingRecommendations}
              sx={{ mr: 2 }}
            >
              {loadingRecommendations ? 'Loading...' : 'Get Recommendations'}
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />} 
              onClick={handleNewBudget}
            >
              New Budget
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Active Budgets" />
            <Tab label="Inactive Budgets" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <div>
            <TabPanel value={tabValue} index={0}>
              {activeBudgets.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No active budgets found
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }} 
                    onClick={handleNewBudget}
                  >
                    Create a Budget
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {activeBudgets.map((budget) => (
                    <Grid item xs={12} md={6} lg={4} key={budget._id}>
                      <BudgetCard 
                        budget={budget} 
                        onEdit={handleEditBudget} 
                        onDelete={handleDeleteClick}
                        getProgressColor={getProgressColor}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {inactiveBudgets.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No inactive budgets found
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {inactiveBudgets.map((budget) => (
                    <Grid item xs={12} md={6} lg={4} key={budget._id}>
                      <BudgetCard 
                        budget={budget} 
                        onEdit={handleEditBudget} 
                        onDelete={handleDeleteClick}
                        getProgressColor={getProgressColor}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          </div>
        )}

        {/* Add/Edit Budget Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {currentBudget ? 'Edit Budget' : 'Create Budget'}
          </DialogTitle>
          <Formik
            initialValues={
              currentBudget ? {
                name: currentBudget.name || '',
                amount: currentBudget.amount || '',
                period: currentBudget.period || 'monthly',
                startDate: currentBudget.startDate ? new Date(currentBudget.startDate) : new Date(),
                endDate: currentBudget.endDate ? new Date(currentBudget.endDate) : null,
                category: currentBudget.category?._id || '',
                tags: currentBudget.tags || [],
                notificationThreshold: currentBudget.notificationThreshold || 0.8,
                isActive: currentBudget.isActive !== undefined ? currentBudget.isActive : true
              } : {
                name: '',
                amount: '',
                period: 'monthly',
                startDate: new Date(),
                endDate: null,
                category: '',
                tags: [],
                notificationThreshold: 0.8,
                isActive: true
              }
            }
            validationSchema={budgetValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
              <Form>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="name"
                        name="name"
                        label="Budget Name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="amount"
                        name="amount"
                        label="Budget Amount"
                        type="number"
                        value={values.amount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.amount && Boolean(errors.amount)}
                        helperText={touched.amount && errors.amount}
                        InputProps={{
                          startAdornment: <InputLabel>$</InputLabel>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="period-label">Period</InputLabel>
                        <Select
                          labelId="period-label"
                          id="period"
                          name="period"
                          value={values.period}
                          onChange={handleChange}
                          label="Period"
                        >
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="yearly">Yearly</MenuItem>
                          <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                        {touched.period && errors.period && (
                          <FormHelperText error>{errors.period}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          id="category"
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                          label="Category"
                        >
                          <MenuItem value="">
                            <em>Overall Budget (no specific category)</em>
                          </MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={values.startDate}
                          onChange={(newValue) => {
                            setFieldValue('startDate', newValue);
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: touched.startDate && Boolean(errors.startDate),
                              helperText: touched.startDate && errors.startDate
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={values.endDate}
                          onChange={(newValue) => {
                            setFieldValue('endDate', newValue);
                          }}
                          disabled={values.period !== 'custom'}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={touched.endDate && Boolean(errors.endDate)}
                              helperText={touched.endDate && errors.endDate}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="tags-label">Tags</InputLabel>
                        <Select
                          labelId="tags-label"
                          id="tags"
                          name="tags"
                          multiple
                          value={values.tags}
                          onChange={handleChange}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} />
                              ))}
                            </Box>
                          )}
                          label="Tags"
                        >
                          {availableTags.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                              {tag}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="notificationThreshold"
                        name="notificationThreshold"
                        label="Alert Threshold (0.8 = 80%)"
                        type="number"
                        value={values.notificationThreshold}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.notificationThreshold && Boolean(errors.notificationThreshold)}
                        helperText={touched.notificationThreshold && errors.notificationThreshold}
                        inputProps={{ step: 0.05, min: 0, max: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                          labelId="status-label"
                          id="isActive"
                          name="isActive"
                          value={values.isActive}
                          onChange={handleChange}
                          label="Status"
                        >
                          <MenuItem value={true}>Active</MenuItem>
                          <MenuItem value={false}>Inactive</MenuItem>
                        </Select>
                      </FormControl>
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
              Are you sure you want to delete this budget? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteBudget} 
              color="error" 
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Recommendations Dialog */}
        <Dialog
          open={openRecommendations}
          onClose={() => setOpenRecommendations(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Budget Recommendations</DialogTitle>
          <DialogContent>
            {loadingRecommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : recommendations.length === 0 ? (
              <Typography>No recommendations available at this time.</Typography>
            ) : (
              <List>
                {recommendations.map((rec, index) => (
                  <ListItem key={index} divider={index < recommendations.length - 1}>
                    <ListItemIcon>
                      {rec.type === 'new' && <Add color="primary" />}
                      {rec.type === 'increase' && <TrendingUp color="warning" />}
                      {rec.type === 'decrease' && <TrendingDown color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <span>
                          {rec.type === 'new' ? (
                            `Create a new ${rec.categoryName} budget of ${formatCurrency(rec.suggestedBudget)}`
                          ) : rec.type === 'increase' ? (
                            `Increase ${rec.categoryName} budget from ${formatCurrency(rec.currentBudget)} to ${formatCurrency(rec.suggestedBudget)}`
                          ) : (
                            `Decrease ${rec.categoryName} budget from ${formatCurrency(rec.currentBudget)} to ${formatCurrency(rec.suggestedBudget)}`
                          )}
                        </span>
                      }
                      secondary={rec.reason}
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      endIcon={<Check />}
                      onClick={() => applyRecommendation(rec)}
                    >
                      Apply
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRecommendations(false)}>Close</Button>
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

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`budget-tabpanel-${index}`}
      aria-labelledby={`budget-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Budget Card component
const BudgetCard = ({ budget, onEdit, onDelete, getProgressColor }) => {
  const usagePercentage = (budget.currentSpending / budget.amount) * 100;
  const isExceeded = budget.currentSpending > budget.amount;
  const progressColor = getProgressColor(usagePercentage);
  
  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" gutterBottom>
            {budget.name}
          </Typography>
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(budget)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(budget)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          {budget.category && (
            <Chip 
              label={budget.category.name} 
              size="small" 
              sx={{ bgcolor: budget.category.color, color: 'white', mr: 1 }}
            />
          )}
          {budget.period === 'monthly' && <Chip label="Monthly" size="small" color="primary" sx={{ mr: 1 }} />}
          {budget.period === 'yearly' && <Chip label="Yearly" size="small" color="secondary" sx={{ mr: 1 }} />}
          {budget.period === 'custom' && <Chip label="Custom Period" size="small" color="info" sx={{ mr: 1 }} />}
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Budget: {formatCurrency(budget.amount)}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          Spent: {formatCurrency(budget.currentSpending)} ({formatPercentage(usagePercentage)})
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={Math.min(usagePercentage, 100)} 
          sx={{ 
            mb: 2, 
            height: 8, 
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              backgroundColor: progressColor
            }
          }}
        />
        
        <Typography variant="body2" gutterBottom>
          Remaining: {formatCurrency(budget.amount - budget.currentSpending)}
        </Typography>
        
        {isExceeded && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Warning color="error" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="error">
              Budget exceeded by {formatCurrency(budget.currentSpending - budget.amount)}
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="caption" color="text.secondary">
          {budget.period === 'custom' 
            ? `${formatDate(budget.startDate)} - ${formatDate(budget.endDate)}`
            : budget.period === 'monthly'
            ? 'Current month'
            : 'Current year'
          }
        </Typography>
        
        {budget.tags && budget.tags.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {budget.tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Budgets; 