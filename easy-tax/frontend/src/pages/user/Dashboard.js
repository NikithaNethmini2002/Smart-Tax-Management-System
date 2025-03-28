import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Button,
  LinearProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import UserLayout from '../../components/UserLayout';
import { AuthContext } from '../../context/AuthContext';
import TransactionService from '../../services/transaction.service';

const Dashboard = () => {
  const { auth, fetchUserProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    income: 0,
    expense: 0,
    netBalance: 0,
    categoryBreakdown: {}
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile if not already loaded
        if (!auth.user) {
          await fetchUserProfile();
        }
        
        // Fetch transaction summary
        const summary = await TransactionService.getTransactionSummary('monthly');
        console.log('Dashboard summary data:', summary);
        
        if (summary) {
          setSummaryData({
            income: summary.income || 0,
            expense: summary.expense || 0,
            netBalance: (summary.income || 0) - (summary.expense || 0),
            categoryBreakdown: summary.categoryBreakdown || {}
          });
          
          // Set category data for pie chart if available
          if (summary.categoryBreakdown) {
            const categories = Object.entries(summary.categoryBreakdown)
              .map(([name, amount]) => ({ name, value: amount }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5); // Top 5 categories
            
            setCategoryData(categories);
          }
        }
        
        // Get recent transactions
        const transactions = await TransactionService.getAllTransactions();
        setRecentTransactions(transactions.slice(0, 5)); // Get 5 most recent
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [auth, fetchUserProfile]);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const getAmountDisplay = (amount, type) => {
    if (type === 'income') {
      return {
        prefix: '+',
        amount: amount.toFixed(2),
        color: 'success.main'
      };
    } else {
      return {
        prefix: '-',
        amount: amount.toFixed(2),
        color: 'error.main'
      };
    }
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <UserLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {auth.user?.name || 'User'}
        </Typography>
        <Typography color="textSecondary">
          Here's a summary of your financial activity
        </Typography>
      </Box>
      
      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArrowUpwardIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Monthly Income
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(summaryData.income)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArrowDownwardIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Monthly Expenses
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {formatCurrency(summaryData.expense)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Monthly Balance
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                color={summaryData.netBalance >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(summaryData.netBalance)}
              </Typography>
              <Typography 
                variant="body2" 
                color={summaryData.netBalance >= 0 ? 'success.main' : 'error.main'}
              >
                {summaryData.netBalance >= 0 ? 'Saved' : 'Deficit'} this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Category Breakdown and Recent Transactions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Expense Breakdown
            </Typography>
            
            {categoryData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  No expense data available. Add transactions to see your spending breakdown.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/transactions/new"
                  variant="contained"
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Add Transaction
                </Button>
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Transactions
              </Typography>
              <Button 
                component={RouterLink} 
                to="/transactions"
                size="small"
                endIcon={<ReceiptIcon />}
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {recentTransactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  No transactions recorded yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/transactions/new"
                  variant="contained"
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Add Transaction
                </Button>
              </Box>
            ) : (
              <>
                <List>
                  {recentTransactions.map((transaction) => {
                    const amountDisplay = getAmountDisplay(transaction.amount, transaction.type);
                    
                    return (
                      <ListItem 
                        key={transaction._id}
                        component={RouterLink}
                        to={`/transactions/${transaction._id}`}
                        sx={{ 
                          py: 1, 
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <ListItemText
                          primary={transaction.category}
                          secondary={formatDate(transaction.date)}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2" color={amountDisplay.color}>
                            {amountDisplay.prefix} ${amountDisplay.amount}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    component={RouterLink}
                    to="/transactions/new"
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                  >
                    Add Transaction
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </UserLayout>
  );
};

export default Dashboard; 