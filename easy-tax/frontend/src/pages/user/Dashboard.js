import React, { useContext, useEffect, useState } from 'react';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { Link as RouterLink } from 'react-router-dom';
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Button,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  LinearProgress,
  Paper,
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  Chip,
  List,
  ListItem,
  ListItemText,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
  
=======
  ListItemSecondaryAction,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AccountBalance,
  Warning
} from '@mui/icons-material';
import UserLayout from '../../components/UserLayout';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch financial summary
        const summaryRes = await axios.get(`${API_URL}/api/finance/transactions/analytics/summary`);
        setSummary(summaryRes.data);
        
        // Fetch active budgets
        const budgetsRes = await axios.get(`${API_URL}/api/finance/budgets?isActive=true`);
        setBudgets(budgetsRes.data);
        
        // Fetch recent transactions
        const txRes = await axios.get(`${API_URL}/api/finance/transactions?limit=5`);
        setRecentTransactions(txRes.data.transactions);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
=======
  ListItemSecondaryAction,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AccountBalance,
  Warning
} from '@mui/icons-material';
import UserLayout from '../../components/UserLayout';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch financial summary
        const summaryRes = await axios.get(`${API_URL}/api/finance/transactions/analytics/summary`);
        setSummary(summaryRes.data);
        
        // Fetch active budgets
        const budgetsRes = await axios.get(`${API_URL}/api/finance/budgets?isActive=true`);
        setBudgets(budgetsRes.data);
        
        // Fetch recent transactions
        const txRes = await axios.get(`${API_URL}/api/finance/transactions?limit=5`);
        setRecentTransactions(txRes.data.transactions);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
>>>>>>> Stashed changes

    if (auth.isAuthenticated) {
      fetchDashboardData();
    }
  }, [auth.isAuthenticated]);

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  return (
    <UserLayout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {auth.user?.name || 'User'}
        </Typography>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Financial Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Income
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(summary?.totals?.income || 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {summary?.totals?.incomeCount || 0} transactions this month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <TrendingDown sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Expenses
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(summary?.totals?.expense || 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {summary?.totals?.expenseCount || 0} transactions this month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <AccountBalance sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Balance
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(summary?.totals?.balance || 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {summary?.totals?.balance >= 0 ? 'Positive' : 'Negative'} balance this month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
<<<<<<< Updated upstream
            </Grid>
            
            {/* Budget tracking */}
            <Typography variant="h5" gutterBottom>
              Budget Tracking
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {budgets.length === 0 ? (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1" align="center">
                        No active budgets. Create a budget to track your spending.
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button 
                          variant="contained" 
                          onClick={() => navigate('/budget/create')}
                        >
                          Create Budget
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                budgets.slice(0, 3).map(budget => (
                  <Grid item xs={12} md={4} key={budget._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">
                            {budget.name}
                          </Typography>
                          {budget.isExceeded && (
                            <Chip 
                              icon={<Warning />} 
                              label="Exceeded" 
                              color="error" 
                              size="small"
                            />
                          )}
                          {!budget.isExceeded && budget.isExceedingThreshold && (
                            <Chip 
                              icon={<Warning />} 
                              label="Near Limit" 
                              color="warning" 
                              size="small"
                            />
                          )}
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(budget.usagePercentage, 100)} 
                          color={budget.isExceeded ? "error" : budget.isExceedingThreshold ? "warning" : "primary"}
                          sx={{ height: 10, borderRadius: 5, mb: 1 }}
                        />
                        
                        <Typography variant="body2" color="textSecondary">
                          {formatCurrency(budget.currentSpending)} of {formatCurrency(budget.amount)}
                          {' '}({Math.round(budget.usagePercentage)}%)
                        </Typography>
                        
                        {budget.category && (
                          <Chip 
                            label={budget.category.name} 
                            size="small" 
                            sx={{ mt: 1, bgcolor: budget.category.color, color: 'white' }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
              
              {budgets.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/budgets')}
                    >
                      View All Budgets
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
            
=======
            </Grid>
            
            {/* Budget tracking */}
            <Typography variant="h5" gutterBottom>
              Budget Tracking
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {budgets.length === 0 ? (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1" align="center">
                        No active budgets. Create a budget to track your spending.
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button 
                          variant="contained" 
                          onClick={() => navigate('/budget/create')}
                        >
                          Create Budget
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                budgets.slice(0, 3).map(budget => (
                  <Grid item xs={12} md={4} key={budget._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">
                            {budget.name}
                          </Typography>
                          {budget.isExceeded && (
                            <Chip 
                              icon={<Warning />} 
                              label="Exceeded" 
                              color="error" 
                              size="small"
                            />
                          )}
                          {!budget.isExceeded && budget.isExceedingThreshold && (
                            <Chip 
                              icon={<Warning />} 
                              label="Near Limit" 
                              color="warning" 
                              size="small"
                            />
                          )}
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(budget.usagePercentage, 100)} 
                          color={budget.isExceeded ? "error" : budget.isExceedingThreshold ? "warning" : "primary"}
                          sx={{ height: 10, borderRadius: 5, mb: 1 }}
                        />
                        
                        <Typography variant="body2" color="textSecondary">
                          {formatCurrency(budget.currentSpending)} of {formatCurrency(budget.amount)}
                          {' '}({Math.round(budget.usagePercentage)}%)
                        </Typography>
                        
                        {budget.category && (
                          <Chip 
                            label={budget.category.name} 
                            size="small" 
                            sx={{ mt: 1, bgcolor: budget.category.color, color: 'white' }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
              
              {budgets.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/budgets')}
                    >
                      View All Budgets
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
            
>>>>>>> Stashed changes
            {/* Recent Transactions */}
            <Typography variant="h5" gutterBottom>
              Recent Transactions
            </Typography>
            <Card sx={{ mb: 4 }}>
              <List>
                {recentTransactions.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No recent transactions" />
                  </ListItem>
                ) : (
                  recentTransactions.map(tx => (
                    <ListItem 
                      key={tx._id}
                      button
                      onClick={() => navigate(`/transactions/${tx._id}`)}
                    >
                      <ListItemText
                        primary={
                          <Box>
                            {tx.description || (tx.type === 'income' ? 'Income' : 'Expense')}
                            {tx.category && (
                              <Chip
                                label={tx.category.name}
                                size="small"
                                sx={{ ml: 1, bgcolor: tx.category.color, color: 'white' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={formatDate(tx.date)}
                      />
                      <ListItemSecondaryAction>
                        <Typography 
                          variant="body1" 
                          color={tx.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/transactions')}
                >
                  View All Transactions
                </Button>
              </Box>
            </Card>
            
            {/* Basic Profile Info - Keeping this from the original dashboard */}
            <Typography variant="h5" gutterBottom>
              Your Profile
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
          </>
        )}
      </Box>
>>>>>>> Stashed changes
    </UserLayout>
  );
};

export default Dashboard; 