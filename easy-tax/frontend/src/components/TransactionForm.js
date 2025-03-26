import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Validation schema
const TransactionSchema = Yup.object().shape({
  type: Yup.string().oneOf(['income', 'expense'], 'Invalid transaction type').required('Type is required'),
  amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
  date: Yup.date().required('Date is required'),
  category: Yup.string().required('Category is required'),
  description: Yup.string(),
  tags: Yup.string(),
  paymentMethod: Yup.string().oneOf(['cash', 'credit card', 'debit card', 'bank transfer', 'other'], 'Invalid payment method')
});

const TransactionForm = ({ initialValues, onSubmit, isSubmitting, buttonText }) => {
  // Categories
  const expenseCategories = [
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

  const incomeCategories = [
    'Salary',
    'Business',
    'Investments',
    'Gifts',
    'Rental',
    'Refunds',
    'Other'
  ];

  const paymentMethods = [
    'cash',
    'credit card',
    'debit card',
    'bank transfer',
    'other'
  ];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={TransactionSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, setFieldValue }) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                select
                fullWidth
                name="type"
                label="Transaction Type"
                value={values.type}
                onChange={handleChange}
                error={touched.type && Boolean(errors.type)}
                helperText={touched.type && errors.type}
                margin="normal"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Field>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                fullWidth
                name="amount"
                label="Amount"
                type="number"
                value={values.amount}
                onChange={handleChange}
                error={touched.amount && Boolean(errors.amount)}
                helperText={touched.amount && errors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={values.date ? new Date(values.date) : null}
                  onChange={(newValue) => {
                    setFieldValue('date', newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={touched.date && Boolean(errors.date)}
                      helperText={touched.date && errors.date}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                select
                fullWidth
                name="category"
                label="Category"
                value={values.category}
                onChange={handleChange}
                error={touched.category && Boolean(errors.category)}
                helperText={touched.category && errors.category}
                margin="normal"
              >
                {values.type === 'expense' ? (
                  expenseCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))
                ) : (
                  incomeCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))
                )}
              </Field>
            </Grid>

            <Grid item xs={12}>
              <Field
                as={TextField}
                fullWidth
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <Field
                as={TextField}
                fullWidth
                name="tags"
                label="Tags (comma separated)"
                value={values.tags}
                onChange={handleChange}
                error={touched.tags && Boolean(errors.tags)}
                helperText={touched.tags && errors.tags}
                margin="normal"
                placeholder="e.g., vacation, work, utilities"
              />
              <Typography variant="caption" color="textSecondary">
                Enter tags separated by commas. The # symbol will be added automatically if omitted.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                select
                fullWidth
                name="paymentMethod"
                label="Payment Method"
                value={values.paymentMethod}
                onChange={handleChange}
                error={touched.paymentMethod && Boolean(errors.paymentMethod)}
                helperText={touched.paymentMethod && errors.paymentMethod}
                margin="normal"
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </MenuItem>
                ))}
              </Field>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                >
                  {buttonText || 'Submit'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default TransactionForm; 