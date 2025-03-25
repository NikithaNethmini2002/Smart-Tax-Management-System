import React, { useState, useContext, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormHelperText,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import UserLayout from '../../components/UserLayout';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

// Phone validation regex
const phoneRegExp = /^\+[1-9]\d{1,14}$/;

// Validation schema
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  address: Yup.string().required('Address is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Invalid gender').required('Gender is required'),
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Phone number must include country code (e.g., +1234567890)')
    .required('Phone number is required')
});

const Profile = () => {
  const { auth, fetchUserProfile, logout } = useContext(AuthContext);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user && auth.user.id) {
      fetchUserProfile(auth.user.id, auth.isAdmin);
    }
  }, [auth.user?.id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.put(`${API_URL}/api/users/profile`, values);
      setSuccess('Profile updated successfully');
      setError('');
      
      // Refresh user profile
      if (auth.user && auth.user.id) {
        fetchUserProfile(auth.user.id, auth.isAdmin);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/api/users`);
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setOpenDialog(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  if (!auth.user) {
    return (
      <UserLayout title="Profile">
        <Typography>Loading profile...</Typography>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Profile">
      <Box>
        <Typography variant="h4" gutterBottom>
          Your Profile
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
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Formik
              initialValues={{
                firstName: auth.user.firstName || '',
                lastName: auth.user.lastName || '',
                address: auth.user.address || '',
                gender: auth.user.gender || '',
                phoneNumber: auth.user.phoneNumber || ''
              }}
              validationSchema={ProfileSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="firstName"
                        label="First Name"
                        variant="outlined"
                        error={errors.firstName && touched.firstName}
                        helperText={touched.firstName && errors.firstName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="lastName"
                        label="Last Name"
                        variant="outlined"
                        error={errors.lastName && touched.lastName}
                        helperText={touched.lastName && errors.lastName}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="address"
                        label="Address"
                        variant="outlined"
                        error={errors.address && touched.address}
                        helperText={touched.address && errors.address}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={auth.user.email || ''}
                        variant="outlined"
                        disabled
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Birthday"
                        type="date"
                        value={formatDate(auth.user.birthday)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        disabled
                        helperText="Birthday cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        select
                        fullWidth
                        name="gender"
                        label="Gender"
                        variant="outlined"
                        error={errors.gender && touched.gender}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Field>
                      {touched.gender && errors.gender && (
                        <FormHelperText error>{errors.gender}</FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="phoneNumber"
                        label="Phone Number (with country code)"
                        variant="outlined"
                        placeholder="+1234567890"
                        error={errors.phoneNumber && touched.phoneNumber}
                        helperText={touched.phoneNumber && errors.phoneNumber}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        sx={{ mt: 2 }}
                      >
                        Update Profile
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom color="error">
            Danger Zone
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => setOpenDialog(true)}
          >
            Delete Account
          </Button>
          
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
          >
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete your account? This action cannot be undone.
                All your data will be permanently removed.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleDeleteAccount} color="error">Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </UserLayout>
  );
};

export default Profile; 