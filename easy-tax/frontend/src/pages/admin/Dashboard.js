import React, { useContext, useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Divider,
  Button,
  CircularProgress,
  CardHeader
} from '@mui/material';
import { 
  PeopleAlt as PeopleIcon, 
  AdminPanelSettings as AdminIcon 
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get users count
        const usersRes = await axios.get(`${API_URL}/api/admin/users`);
        // Get admins count
        const adminsRes = await axios.get(`${API_URL}/api/admin/admins`);
        
        setStats({
          totalUsers: usersRes.data.length,
          totalAdmins: adminsRes.data.length,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome, {auth.user?.firstName}!
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to Easy Tax Admin Dashboard. Manage users and administrators from here.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          System Statistics
        </Typography>
        
        {stats.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardHeader
                  avatar={<PeopleIcon />}
                  title="Total Users"
                />
                <CardContent>
                  <Typography variant="h3" component="div" align="center">
                    {stats.totalUsers}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate('/admin/users')}
                    >
                      Manage Users
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <CardHeader
                  avatar={<AdminIcon />}
                  title="Total Admins"
                />
                <CardContent>
                  <Typography variant="h3" component="div" align="center">
                    {stats.totalAdmins}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => navigate('/admin/admins')}
                    >
                      Manage Admins
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
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
        
        
      </Box>
    </AdminLayout>
  );
};

export default Dashboard; 