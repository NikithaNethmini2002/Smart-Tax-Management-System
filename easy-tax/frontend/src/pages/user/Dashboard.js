import React, { useContext, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import UserLayout from '../../components/UserLayout';
import { AuthContext } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_URL } from '../../config';

const Dashboard = () => {
  const { auth, fetchUserProfile, setAuth } = useContext(AuthContext);
  
  // Improve the useEffect hook for debugging
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Dashboard effect - Auth state:', {
          isAuthenticated: auth.isAuthenticated,
          hasUser: !!auth.user,
          hasUserName: auth.user && !!auth.user.firstName,
          loading: auth.loading
        });
        
        if (auth.isAuthenticated && (!auth.user || !auth.user.firstName)) {
          console.log('User data missing, attempting to fetch it');
          
          // Important: Make sure auth header is set before making requests
          const token = localStorage.getItem('token');
          if (token) {
            // First, ensure the Authorization header is set
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Reset Authorization header in Dashboard:', 
                       axios.defaults.headers.common['Authorization']);
            
            try {
              const decoded = jwtDecode(token);
              console.log('Token decoded in Dashboard:', decoded);
              
              // Extract user ID from token
              let userId;
              if (decoded.id) {
                userId = decoded.id;
              } else if (decoded.user && decoded.user.id) {
                userId = decoded.user.id;
              }
              
              if (userId) {
                console.log('Fetching user profile from Dashboard for user ID:', userId);
                // Make direct API call to bypass potential stale auth state
                try {
                  const res = await axios.get(`${API_URL}/api/users/profile`);
                  console.log('Direct profile fetch result:', res.data);
                  // Update auth state with the profile data
                  auth.user = res.data;
                  setAuth(prev => ({ 
                    ...prev, 
                    user: res.data,
                    loading: false
                  }));
                } catch (apiError) {
                  console.error('Direct API call failed:', apiError);
                  // Fall back to the context method
                  await fetchUserProfile(userId, auth.isAdmin);
                }
              } else {
                console.error('No user ID found in token:', decoded);
              }
            } catch (err) {
              console.error('Error decoding token in Dashboard:', err);
            }
          } else {
            console.error('No token found in localStorage');
          }
        } else {
          console.log('User data is already available, no need to fetch');
        }
      } catch (err) {
        console.error('Error in Dashboard useEffect:', err);
      }
    };
    
    fetchData();
  }, [auth.isAuthenticated, auth.user, auth.loading, fetchUserProfile, setAuth]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Create a more informative loading state
  if (auth.loading) {
    return (
      <UserLayout title="Dashboard">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading user data...</Typography>
        </Box>
      </UserLayout>
    );
  }

  if (!auth.user || !auth.user.firstName) {
    return (
      <UserLayout title="Dashboard">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <Typography color="error" variant="h6">
            Error Loading User Data
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Could not load your profile information. Please try logging in again.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }}
          >
            Return to Login
          </Button>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Dashboard">
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome, {auth.user?.firstName}!
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to Easy Tax - your personal tax management platform.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Your Profile Summary
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {auth.user?.firstName} {auth.user?.lastName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {auth.user?.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Gender:</strong> {auth.user?.gender || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Birthday:</strong> {formatDate(auth.user?.birthday)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Address:</strong> {auth.user?.address || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Phone Number:</strong> {auth.user?.phoneNumber || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Account Created:</strong> {formatDate(auth.user?.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Quick Links
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => window.location.href = '/profile'}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Update Profile
                  </Typography>
                  <Typography variant="body2">
                    Update your personal information and contact details.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => window.location.href = '/change-password'}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Typography variant="body2">
                    Update your password for enhanced security.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </UserLayout>
  );
};

export default Dashboard; 