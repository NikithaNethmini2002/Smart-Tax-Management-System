import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Link,
  MenuItem,
  FormHelperText,
  Alert,
  Paper
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

// Phone validation regex
const phoneRegExp = /^\+[1-9]\d{1,14}$/;

// Validation schema
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  address: Yup.string().required('Address is required'),
  birthday: Yup.date()
    .required('Birthday is required')
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'You must be at least 18 years old'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Invalid gender').required('Gender is required'),
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Phone number must include country code (e.g., +1234567890)')
    .required('Phone number is required')
});

const AdminRegister = () => {
  const { registerAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Format birthday to ISO string
      const formattedValues = {
        ...values,
        birthday: new Date(values.birthday).toISOString()
      };
      
      // Remove confirmPassword as it's not needed for the API
      delete formattedValues.confirmPassword;
      
      const response = await registerAdmin(formattedValues);
      
      if (response.success) {
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Easy Tax
          </Typography>
          <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
            Admin Registration
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
              address: '',
              birthday: '',
              gender: '',
              phoneNumber: ''
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
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
                      name="email"
                      label="Email Address"
                      variant="outlined"
                      error={errors.email && touched.email}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      variant="outlined"
                      error={errors.password && touched.password}
                      helperText={touched.password && errors.password}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      variant="outlined"
                      error={errors.confirmPassword && touched.confirmPassword}
                      helperText={touched.confirmPassword && errors.confirmPassword}
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
                    <Field
                      as={TextField}
                      fullWidth
                      name="birthday"
                      label="Birthday"
                      type="date"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      error={errors.birthday && touched.birthday}
                      helperText={touched.birthday && errors.birthday}
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
                  <Grid item xs={12}>
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
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{ mt: 2, mb: 2 }}
                    >
                      Register
                    </Button>
                  </Grid>
                </Grid>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link component={RouterLink} to="/admin/login" variant="body2">
                      Already have an admin account? Sign in
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminRegister; 