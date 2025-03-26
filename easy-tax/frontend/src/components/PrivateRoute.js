import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute = ({ children, isAdmin = false }) => {
  const { auth } = useContext(AuthContext);
  
  console.log('PrivateRoute auth status:', auth.isAuthenticated);
  console.log('PrivateRoute auth token:', auth.token ? 'Token exists' : 'No token');

  if (auth.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!auth.isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/login" : "/login"} replace />;
  }
  
  if (isAdmin && !auth.isAdmin) {
    console.log('User is not admin, redirecting to user dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!isAdmin && auth.isAdmin) {
    console.log('User is admin, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

export default PrivateRoute; 