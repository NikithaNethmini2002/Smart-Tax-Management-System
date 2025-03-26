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
        setBudget(budgetData);
        
        // Get budget status
        const statusData = await BudgetService.getBudgetStatus(id);
        setBudgetStatus(statusData);
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
      navigate('/budgets', { state: { success: 'Budget deleted successfully' } });
    } catch (err) {
      setError('Failed to delete budget');
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
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

  if (loading) {
    return (
      <UserLayout title="Budget Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (error || !budget) {
    return (
      <UserLayout title="Budget Details">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Budget not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/budgets"
          sx={{ mt: 2 }}
        >
          Back to Budgets
        </Button>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Budget Details">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/budgets"
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
                to={`/budgets/edit/${budget._id}`}
                color="primary"
                aria-label="edit budget"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                aria-label="delete budget"
                onClick={() => setOpenDeleteDialog(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Budget Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Amount:
                </Typography>
                <Typography variant="h6">
                  ${budget.amount.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Period:
                </Typography>
                <Typography variant="body1">
                  {getPeriodLabel(budget.period)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Category:
                </Typography>
                <Typography variant="body1">
                  {budget.category || 'All Categories'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Start Date:
                </Typography>
                <Typography variant="body1">
                  {formatDate(budget.startDate)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Notification Threshold:
                </Typography>
                <Typography variant="body1">
                  {budget.notificationThreshold}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {budgetStatus ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Current Status
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        ${budgetStatus.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {budgetStatus.percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(budgetStatus.percentage, 100)} 
                      color={getProgressColor(budgetStatus.percentage)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Spent:
                    </Typography>
                    <Typography variant="h6">
                      ${budgetStatus.spent.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Remaining:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={budgetStatus.remaining < 0 ? 'error.main' : 'success.main'}
                    >
                      ${budgetStatus.remaining.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {budgetStatus.percentage >= budget.notificationThreshold && (
                    <Alert 
                      severity={budgetStatus.percentage >= 100 ? 'error' : 'warning'}
                      icon={<WarningIcon />}
                      sx={{ mt: 2 }}
                    >
                      {budgetStatus.percentage >= 100 
                        ? 'Budget exceeded! You have spent more than your planned budget.' 
                        : `Alert: You've used ${budgetStatus.percentage.toFixed(0)}% of your budget.`
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