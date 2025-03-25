import React, { useState, useContext } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import UserLayout from '../../components/UserLayout';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';

// Validation schema
const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const ChangePassword = () => {
  const { auth } = useContext(AuthContext);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Remove confirmPassword as it's not needed for the API
      const { confirmPassword, ...passwordData } = values;
      
      await axios.put(`${API_URL}/api/users/password`, passwordData);
      
      setSuccess('Password changed successfully');
      setError('');
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout title="Change Password">
      <Box>
        <Typography variant="h4" gutterBottom>
          Change Password
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Card>
          <CardContent>
            <Formik
              initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              }}
              validationSchema={PasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Field
                    as={TextField}
                    fullWidth
                    margin="normal"
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    error={errors.currentPassword && touched.currentPassword}
                    helperText={touched.currentPassword && errors.currentPassword}
                  />
                  
                  <Field
                    as={TextField}
                    fullWidth
                    margin="normal"
                    name="newPassword"
                    label="New Password"
                    type="password"
                    variant="outlined"
                    error={errors.newPassword && touched.newPassword}
                    helperText={touched.newPassword && errors.newPassword}
                  />
                  
                  <Field
                    as={TextField}
                    fullWidth
                    margin="normal"
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    error={errors.confirmPassword && touched.confirmPassword}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ mt: 3 }}
                  >
                    Change Password
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Box>
    </UserLayout>
  );
};

export default ChangePassword; 