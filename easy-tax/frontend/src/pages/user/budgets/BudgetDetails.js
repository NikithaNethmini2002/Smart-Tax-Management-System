import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Button,
  Divider,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import UserLayout from '../../../components/UserLayout';
import BudgetService from '../../../services/budget.service';

const BudgetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchBudgetDetails = async () => {
      try {
        setLoading(true);
        
        // Get budget details
        const budgetData = await BudgetService.getBudgetById(id);
        console.log('Budget data:', budgetData);
        setBudget(budgetData);
        
        // Get budget status
        const statusData = await BudgetService.getBudgetStatus(id);
        console.log('Budget status data:', statusData);
        
        // Make sure we have valid status data
        setBudgetStatus({
          spent: statusData.spent !== undefined ? statusData.spent : 0,
          remaining: statusData.remaining !== undefined ? statusData.remaining : 
            (budgetData.amount - (statusData.spent || 0)),
          percentage: statusData.percentage !== undefined ? statusData.percentage : 
            ((statusData.spent || 0) / budgetData.amount * 100)
        });
      } catch (err) {
        console.error('Error fetching budget details:', err);
        setError('Failed to load budget details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgetDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await BudgetService.deleteBudget(id);
      navigate('/budgets');
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget');
      setOpenDeleteDialog(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return '$0.00';
    }
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) {
      return '0%';
    }
    return `${Number(value).toFixed(0)}%`;
  };

  const getProgressColor = (percentage) => {
    if (percentage === undefined || percentage === null) {
      return 'primary';
    }
    
    if (percentage >= 100) {
      return 'error';
    } else if (percentage >= 80) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return period;
    }
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
        <Alert severity="info" sx={{ mt: 2 }}>
          Budget not found or you don't have permission to view it.
        </Alert>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Budget Details">
      <Box sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          to="/budgets"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Budgets
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{budget.name}</Typography>
            <Box>
              <IconButton
                component={RouterLink}
                to={`/budgets/edit/${id}`}
                color="primary"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                color="error" 
                onClick={() => setOpenDeleteDialog(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                Category:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {budget.category || 'All Categories'}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Budget Period:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {getPeriodLabel(budget.period)}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Start Date:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(budget.startDate)}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Budget Amount:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatCurrency(budget.amount)}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Notification Threshold:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatPercentage(budget.notificationThreshold)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Budget Status
              </Typography>
              
              {budgetStatus ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(budgetStatus.percentage || 0, 100)} 
                      color={getProgressColor(budgetStatus.percentage)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        {formatPercentage(budgetStatus.percentage || 0)} Used
                      </Typography>
                      <Typography variant="body2" color={getProgressColor(budgetStatus.percentage)}>
                        {budgetStatus.percentage >= 100 ? 'Exceeded' : budgetStatus.percentage >= 80 ? 'Warning' : 'On Track'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 1 }}>
                    <Typography variant="subtitle1">
                      Spent:
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatCurrency(budgetStatus.spent || 0)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="subtitle1">
                      Remaining:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={(budgetStatus.remaining || 0) < 0 ? 'error.main' : 'success.main'}
                    >
                      {formatCurrency(budgetStatus.remaining || 0)}
                    </Typography>
                  </Box>
                  
                  {(budgetStatus.percentage || 0) >= (budget.notificationThreshold || 80) && (
                    <Alert 
                      severity={(budgetStatus.percentage || 0) >= 100 ? 'error' : 'warning'}
                      icon={<WarningIcon />}
                      sx={{ mt: 2 }}
                    >
                      {(budgetStatus.percentage || 0) >= 100 
                        ? 'Budget exceeded! You have spent more than your planned budget.' 
                        : `Alert: You've used ${formatPercentage(budgetStatus.percentage || 0)} of your budget.`
                      }
                    </Alert>
                  )}
                </>
              ) : (
                <Typography>No spending data available for this budget yet.</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Budget</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this budget? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </UserLayout>
  );
};

export default BudgetDetails; 