import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const AdminRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);
  
  console.log('AdminRoute auth state:', {
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    loading: auth.loading
  });

  if (auth.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!auth.isAdmin) {
    console.log('User is not admin, redirecting to user dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default AdminRoute; 