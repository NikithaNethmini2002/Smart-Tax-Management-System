import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import UserLayout from '../../../components/UserLayout';
import BudgetForm from '../../../components/BudgetForm';
import BudgetService from '../../../services/budget.service';

const BudgetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Categories for budgets
  const categories = [
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

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setLoading(true);
        console.log('Fetching budget with ID:', id);
        
        if (!id || id === 'undefined') {
          setError('Invalid budget ID');
          setLoading(false);
          return;
        }
        
        const data = await BudgetService.getBudgetById(id);
        console.log('Budget data received:', data);
        
        if (!data || !data._id) {
          setError('Invalid budget data received');
          setLoading(false);
          return;
        }
        
        setBudget({
          name: data.name || '',
          amount: data.amount || '',
          period: data.period || 'monthly',
          category: data.category || '',
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          notificationThreshold: data.notificationThreshold || 80
        });
        
      } catch (err) {
        console.error('Error fetching budget:', err);
        setError('Budget not found or you don\'t have permission to edit it.');
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Make API call to update budget
      await BudgetService.updateBudget(id, values);
      
      // Show success message
      setOpenSnackbar(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/budgets');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error updating budget');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <UserLayout title="Edit Budget">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (!budget) {
    return (
      <UserLayout title="Edit Budget">
        <Alert severity="error" sx={{ mt: 2 }}>
          Budget not found or you don't have permission to edit it.
        </Alert>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Edit Budget">
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Edit Budget
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <BudgetForm
            initialValues={budget}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            buttonText="Update Budget"
            categories={categories}
          />
        </Paper>
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">
          Budget updated successfully!
        </Alert>
      </Snackbar>
    </UserLayout>
  );
};

export default BudgetEdit; 