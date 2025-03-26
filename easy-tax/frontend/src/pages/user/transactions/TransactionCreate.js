import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import UserLayout from '../../../components/UserLayout';
import TransactionForm from '../../../components/TransactionForm';
import TransactionService from '../../../services/transaction.service';

const TransactionCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const initialValues = {
    type: 'expense',
    amount: '',
    date: new Date(),
    category: '',
    description: '',
    tags: '',
    paymentMethod: 'cash'
  };

  const handleSubmit = async (values, { resetForm }) => {
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

      await TransactionService.createTransaction(processedValues);
      setOpenSnackbar(true);
      
      // Reset form and navigate back after success
      resetForm();
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error creating transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout title="Create Transaction">
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Add New Transaction
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TransactionForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            buttonText="Create Transaction"
          />
        </Paper>
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">
          Transaction created successfully!
        </Alert>
      </Snackbar>
    </UserLayout>
  );
};

export default TransactionCreate; 