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
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import UserLayout from '../../../components/UserLayout';
import TransactionService from '../../../services/transaction.service';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const data = await TransactionService.getTransactionById(id);
        setTransaction(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await TransactionService.deleteTransaction(id);
        navigate('/transactions');
      } catch (err) {
        setError(err.message || 'Error deleting transaction');
      }
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  const formatAmount = (amount, type) => {
    return `${type === 'expense' ? '-' : '+'} $${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <UserLayout title="Transaction Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Transaction Details">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </UserLayout>
    );
  }

  if (!transaction) {
    return (
      <UserLayout title="Transaction Details">
        <Alert severity="error" sx={{ mt: 2 }}>
          Transaction not found or you don't have permission to view it.
        </Alert>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Transaction Details">
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
        <Button
          component={RouterLink}
          to="/transactions"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Transactions
        </Button>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              Transaction Details
            </Typography>
            <Box>
              <Button
                component={RouterLink}
                to={`/transactions/${id}/edit`}
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

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Type
              </Typography>
              <Typography variant="body1" gutterBottom>
                <Chip 
                  label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} 
                  color={transaction.type === 'income' ? 'success' : 'error'}
                  size="small"
                />
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Amount
              </Typography>
              <Typography 
                variant="body1" 
                gutterBottom
                sx={{ 
                  color: transaction.type === 'income' ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Date
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(transaction.date)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Category
              </Typography>
              <Typography variant="body1" gutterBottom>
                {transaction.category}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1" gutterBottom>
                {transaction.description || 'No description provided'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Tags
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {transaction.tags && transaction.tags.length > 0 ? (
                  transaction.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No tags
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Payment Method
              </Typography>
              <Typography variant="body1" gutterBottom>
                {transaction.paymentMethod ? (
                  transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)
                ) : 'Not specified'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Created At
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(transaction.createdAt)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </UserLayout>
  );
};

export default TransactionDetails; 