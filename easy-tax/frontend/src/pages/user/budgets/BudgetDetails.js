import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UserLayout from '../../../components/UserLayout';
import BudgetService from '../../../services/budget.service';

const BudgetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBudgetDetails = async () => {
      try {
        setLoading(true);
        
        // Get budget basic info
        const budgetData = await BudgetService.getBudgetById(id);
        setBudget(budgetData);
        
        // Get budget status (spent, remaining, etc.)
        const statusData = await BudgetService.getBudgetStatus(id);
        setBudgetStatus(statusData);
        
        // The status response also includes the expense trend data
        if (statusData.expenseTrend) {
          setExpenseTrend(statusData.expenseTrend);
        }
        
      } catch (err) {
        setError(err.message || 'Failed to fetch budget details');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await BudgetService.deleteBudget(id);
        navigate('/budgets');
      } catch (err) {
        setError(err.message || 'Error deleting budget');
      }
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
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
  
  // For pie chart colors
  const COLORS = ['#0088FE', '#FFBB28', '#FF8042', '#00C49F', '#9966FF', '#FF6666'];
  
  // Format trend data for display
  const getTrendData = () => {
    if (!expenseTrend || expenseTrend.length === 0) return [];
    
    return expenseTrend.map(item => {
      let name = '';
      if (budget.period === 'monthly' && item._id.day) {
        name = `Day ${item._id.day}`;
      } else if (budget.period === 'yearly' && item._id.month) {
        // Convert month number to name
        name = format(new Date(2022, item._id.month - 1, 1), 'MMMM');
      } else if (budget.period === 'weekly' && item._id.day) {
        // Convert day of week number to name
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        name = days[item._id.day - 1] || `Day ${item._id.day}`;
      }
      
      return {
        name,
        amount: item.total
      };
    });
  };

  if (loading) {
    return (
      <UserLayout title="Budget Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Budget Details">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </UserLayout>
    );
  }

  if (!budget) {
    return (
      <UserLayout title="Budget Details">
        <Alert severity="error" sx={{ mt: 2 }}>
          Budget not found or you don't have permission to view it.
        </Alert>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Budget Details">
      <Box sx={{ maxWidth: 1200, mx: 'auto', my: 2 }}>
        <Button
          component={RouterLink}
          to="/budgets"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Budgets
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              {budget.name}
            </Typography>
            <Box>
              <Button
                component={RouterLink}
                to={`/budgets/${id}/edit`}
                startIcon={<EditIcon />}
                color="primary"
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                startIcon={<DeleteIcon />}
                color="error"
              >
                Delete
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Budget Amount
                </Typography>
                <Typography variant="h4" gutterBottom>
                  ${budget.amount.toFixed(2)}
                </Typography>
                
                <Box sx={{ display: 'flex', mt: 2, mb: 1 }}>
                  <Chip 
                    label={getPeriodLabel(budget.period)} 
                    sx={{ mr: 1 }}
                  />
                  {budget.category && (
                    <Chip label={budget.category} />
                  )}
                </Box>
                
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                  Start Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(budget.startDate)}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                  Notification Threshold
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {budget.notificationThreshold}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {budgetStatus && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Budget Status
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                    <Typography variant="h4" color={budgetStatus.percentage >= 100 ? 'error.main' : 'inherit'}>
                      {budgetStatus.percentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ ml: 1 }}>
                      used
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(budgetStatus.percentage, 100)} 
                      color={getProgressColor(budgetStatus.percentage)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Spent
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        ${budgetStatus.spent.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Remaining
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ${budgetStatus.remaining.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Expense Trend Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Spending Trend
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {expenseTrend.length === 0 ? (
            <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
              No spending data available for this budget period yet.
            </Typography>
          ) : (
            <Box sx={{ height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTrendData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" name="Spending" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Paper>
      </Box>
    </UserLayout>
  );
};

export default BudgetDetails; 