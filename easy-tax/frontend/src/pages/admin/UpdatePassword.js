import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { API_URL } from '../../config';
import AdminLayout from '../../components/AdminLayout';

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const UpdatePassword = () => {
  console.log('UpdatePassword component rendering');

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.put(`${API_URL}/api/admin/password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      setNotification({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
      
      resetForm();
    } catch (error) {
      console.error('Error updating password:', error);
      
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to update password',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Update Password">
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Update Your Password
          </Typography>
          
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={passwordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={touched.currentPassword && Boolean(errors.currentPassword)}
                    helperText={touched.currentPassword && errors.currentPassword}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    name="newPassword"
                    label="New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Field
                    as={TextField}
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                </Box>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default UpdatePassword; 