import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Box,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Slider,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const BudgetForm = ({ initialValues, onSubmit, isSubmitting, buttonText, categories }) => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Budget name is required'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .typeError('Amount must be a number'),
    period: Yup.string()
      .oneOf(['weekly', 'monthly', 'yearly'], 'Invalid period')
      .required('Period is required'),
    notificationThreshold: Yup.number()
      .min(1, 'Threshold must be at least 1%')
      .max(100, 'Threshold cannot exceed 100%')
      .required('Notification threshold is required')
      .typeError('Threshold must be a number')
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      amount: '',
      period: 'monthly',
      category: '',
      startDate: new Date(),
      notificationThreshold: 80
    },
    validationSchema,
    onSubmit
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Budget Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="amount"
              name="amount"
              label="Budget Amount ($)"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={formik.touched.period && Boolean(formik.errors.period)}>
              <InputLabel id="period-label">Period</InputLabel>
              <Select
                labelId="period-label"
                id="period"
                name="period"
                value={formik.values.period}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Period"
                required
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
              {formik.touched.period && formik.errors.period && (
                <FormHelperText>{formik.errors.period}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category (Optional)</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                label="Category (Optional)"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Leave empty to set a budget for all spending
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              value={formik.values.startDate}
              onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
              slotProps={{
                textField: { 
                  fullWidth: true, 
                  variant: 'outlined'
                }
              }}
            />
            <FormHelperText>
              For monthly/yearly budgets, this sets the reference period
            </FormHelperText>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>
              Notification Threshold ({formik.values.notificationThreshold}%)
            </Typography>
            <Slider
              name="notificationThreshold"
              value={formik.values.notificationThreshold}
              onChange={(e, value) => formik.setFieldValue('notificationThreshold', value)}
              aria-labelledby="notification-threshold-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={10}
              max={100}
            />
            <FormHelperText>
              {formik.errors.notificationThreshold || 'Alert when spending reaches this percentage of budget'}
            </FormHelperText>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || !formik.isValid}
              >
                {buttonText || 'Save Budget'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </LocalizationProvider>
  );
};

export default BudgetForm; 