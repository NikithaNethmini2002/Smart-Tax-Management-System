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
import TransactionForm from '../../../components/TransactionForm';
import TransactionService from '../../../services/transaction.service';

const TransactionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const data = await TransactionService.getTransactionById(id);
        
        // Convert tags array to comma-separated string for the form
        if (data.tags && Array.isArray(data.tags)) {
          data.tags = data.tags.join(', ');
        } else {
          data.tags = '';
        }
        
        setTransaction(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Process tags if provided - convert from string to array
      let processedValues = { ...values };
      if (values.tags) {
        processedValues.tags = values.tags.split(',')
          .map(tag => {
            tag = tag.trim();
            return tag.startsWith('#') ? tag : `#${tag}`;
          });
      } else {
        processedValues.tags = [];
      }

      await TransactionService.updateTransaction(id, processedValues);
      setOpenSnackbar(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error updating transaction');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <UserLayout title="Edit Transaction">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (!transaction) {
    return (
      <UserLayout title="Edit Transaction">
        <Alert severity="error" sx={{ mt: 2 }}>
          Transaction not found or you don't have permission to edit it.
        </Alert>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Edit Transaction">
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Edit Transaction
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TransactionForm
            initialValues={transaction}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            buttonText="Update Transaction"
          />
        </Paper>
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">
          Transaction updated successfully!
        </Alert>
      </Snackbar>
    </UserLayout>
  );
};

export default TransactionEdit; 