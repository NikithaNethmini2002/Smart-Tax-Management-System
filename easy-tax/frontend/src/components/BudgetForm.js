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
  Slider,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Validation schema
const BudgetSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
  period: Yup.string().oneOf(['weekly', 'monthly', 'yearly'], 'Invalid period').required('Period is required'),
  category: Yup.string(),
  startDate: Yup.date().required('Start date is required'),
  notificationThreshold: Yup.number().min(1, 'Must be at least 1%').max(100, 'Cannot exceed 100%').required('Notification threshold is required')
});

const BudgetForm = ({ initialValues, onSubmit, isSubmitting, buttonText, categories }) => {
  // Budget periods
  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={BudgetSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, setFieldValue }) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Field
                as={TextField}
                fullWidth
                name="name"
                label="Budget Name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                fullWidth
                name="amount"
                label="Budget Amount"
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
              <Field
                as={TextField}
                select
                fullWidth
                name="period"
                label="Budget Period"
                value={values.period}
                onChange={handleChange}
                error={touched.period && Boolean(errors.period)}
                helperText={touched.period && errors.period}
                margin="normal"
              >
                {periods.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Field>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={values.startDate ? new Date(values.startDate) : null}
                  onChange={(newValue) => {
                    setFieldValue('startDate', newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={touched.startDate && Boolean(errors.startDate)}
                      helperText={touched.startDate && errors.startDate}
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
                label="Category (Optional)"
                value={values.category}
                onChange={handleChange}
                error={touched.category && Boolean(errors.category)}
                helperText={(touched.category && errors.category) || "Leave blank for overall budget"}
                margin="normal"
              >
                <MenuItem value="">No Specific Category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Field>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>
                Notification Threshold: {values.notificationThreshold}%
              </Typography>
              <Slider
                name="notificationThreshold"
                value={values.notificationThreshold}
                onChange={(e, newValue) => {
                  setFieldValue('notificationThreshold', newValue);
                }}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={10}
                max={100}
              />
              <Typography variant="caption" color="textSecondary">
                You'll receive notifications when your spending reaches this percentage of the budget
              </Typography>
              {touched.notificationThreshold && errors.notificationThreshold && (
                <FormHelperText error>{errors.notificationThreshold}</FormHelperText>
              )}
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

export default BudgetForm; 