import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import UserLayout from '../../../components/UserLayout';
import BudgetService from '../../../services/budget.service';

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      console.log('Fetching budgets...');
      const response = await BudgetService.getAllBudgetsStatus();
      console.log('Budgets data received:', response);
      
      // Handle both formats: array or {budgets: array}
      if (Array.isArray(response)) {
        console.log('Response is an array, using directly');
        setBudgets(response);
      } else if (response && response.budgets) {
        console.log('Response has budgets property, using response.budgets');
        setBudgets(response.budgets);
      } else {
        console.error('Unexpected response format:', response);
        setBudgets([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        console.log('Deleting budget with ID:', id);
        
        if (!id) {
          setError('Invalid budget ID');
          return;
        }
        
        await BudgetService.deleteBudget(id);
        console.log('Budget deleted successfully');
        
        // Refresh the budget list
        await fetchBudgets();
        
        setSuccess('Budget deleted successfully');
        setOpenSnackbar(true);
      } catch (err) {
        console.error('Error deleting budget:', err);
        setError(err.message || 'Error deleting budget');
        setOpenSnackbar(true);
      }
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'primary';
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return period;
    }
  };

  return (
    <UserLayout title="Budget Management">
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Your Budgets
          </Typography>
          <Box>
            <Button
              component={RouterLink}
              to="/budgets/recommendations"
              startIcon={<TrendingUpIcon />}
              sx={{ mr: 1 }}
            >
              Recommendations
            </Button>
            <Button
              component={RouterLink}
              to="/budgets/new"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create Budget
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : budgets.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Budgets Found
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Create your first budget to start tracking your spending against your financial goals.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/budgets/new" 
              variant="contained" 
              startIcon={<AddIcon />}
            >
              Create Budget
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {budgets.map((budget) => (
              <Grid item xs={12} sm={6} md={4} key={budget._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                        {budget.name}
                      </Typography>
                      <Chip 
                        label={getPeriodLabel(budget.period)} 
                        size="small" 
                      />
                    </Box>
                    
                    {budget.category && (
                      <Chip 
                        label={budget.category} 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                    )}
                    
                    <Typography variant="body2" color="textSecondary">
                      Budget: ${budget.amount ? budget.amount.toFixed(2) : '0.00'}
                    </Typography>
                    
                    {budget.status && (
                      <>
                        <Typography variant="body2" color="textSecondary">
                          Spent: ${budget.status && typeof budget.status.spent === 'number' ? budget.status.spent.toFixed(2) : '0.00'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(budget.status && typeof budget.status.percentage === 'number' ? budget.status.percentage : 0, 100)} 
                              color={getProgressColor(budget.status && typeof budget.status.percentage === 'number' ? budget.status.percentage : 0)}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="textSecondary">
                              {budget.status && typeof budget.status.percentage === 'number' ? budget.status.percentage.toFixed(0) : '0'}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color={budget.status.percentage >= 100 ? "error" : "textSecondary"}
                          sx={{ mt: 1, fontWeight: budget.status.percentage >= 80 ? 'bold' : 'normal' }}
                        >
                          {budget.status.percentage >= 100 ? (
                            'Budget exceeded!'
                          ) : (
                            `Remaining: $${budget.status && typeof budget.status.remaining === 'number' ? budget.status.remaining.toFixed(2) : '0.00'}`
                          )}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={RouterLink} 
                      to={`/budgets/${budget._id}`}
                      size="small"
                    >
                      Details
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title="Edit">
                      <IconButton
                        component={RouterLink}
                        to={`/budgets/edit/${budget._id}`}
                        size="small"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDelete(budget._id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
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

export default BudgetList; 