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
        const data = await BudgetService.getBudgetById(id);
        setBudget(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch budget details');
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

      await BudgetService.updateBudget(id, values);
      setOpenSnackbar(true);
      
      // Navigate back after success
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