import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Components
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

// User Components
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import ChangePassword from './pages/user/ChangePassword';

// New User Components for Expense and Budget Management
import TransactionList from './pages/user/transactions/TransactionList';
import TransactionCreate from './pages/user/transactions/TransactionCreate';
import TransactionEdit from './pages/user/transactions/TransactionEdit';
import TransactionDetails from './pages/user/transactions/TransactionDetails';
import BudgetList from './pages/user/budgets/BudgetList';
import BudgetCreate from './pages/user/budgets/BudgetCreate';
import BudgetEdit from './pages/user/budgets/BudgetEdit';
import BudgetDetails from './pages/user/budgets/BudgetDetails';
import BudgetRecommendations from './pages/user/budgets/BudgetRecommendations';

// Admin Components
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import UserManagement from './pages/admin/UserManagement';
import AdminManagement from './pages/admin/AdminManagement';
import AdminUpdatePassword from './pages/admin/UpdatePassword';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            
            {/* User Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/change-password" 
              element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              } 
            />
            
            {/* New Transaction Routes */}
            <Route 
              path="/transactions" 
              element={
                <PrivateRoute>
                  <TransactionList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transactions/new" 
              element={
                <PrivateRoute>
                  <TransactionCreate />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transactions/:id" 
              element={
                <PrivateRoute>
                  <TransactionDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transactions/:id/edit" 
              element={
                <PrivateRoute>
                  <TransactionEdit />
                </PrivateRoute>
              } 
            />
            
            {/* New Budget Routes */}
            <Route 
              path="/budgets" 
              element={
                <PrivateRoute>
                  <BudgetList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/budgets/new" 
              element={
                <PrivateRoute>
                  <BudgetCreate />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/budgets/:id" 
              element={
                <PrivateRoute>
                  <BudgetDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/budgets/:id/edit" 
              element={
                <PrivateRoute>
                  <BudgetEdit />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/budgets/recommendations" 
              element={
                <PrivateRoute>
                  <BudgetRecommendations />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Protected Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <AdminRoute>
                  <AdminProfile />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/admins" 
              element={
                <AdminRoute>
                  <AdminManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/update-password" 
              element={
                <AdminRoute>
                  <AdminUpdatePassword />
                </AdminRoute>
              } 
            />
            
            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 