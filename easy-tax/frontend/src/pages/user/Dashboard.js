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
import BudgetService from '../../services/budget.service';

const Dashboard = () => {
  const { auth, fetchUserProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
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
        setSummaryData(summary);
        
        // Get budgets status
        const budgetsResponse = await BudgetService.getAllBudgetsStatus();
        setBudgetData(budgetsResponse.budgets || []);
        
        // Get recent transactions
        const transactions = await TransactionService.getAllTransactions();
        setRecentTransactions(transactions.slice(0, 5)); // Get 5 most recent
        
        // Set category data for pie chart if available
        if (summary && summary.categoryBreakdown) {
          const categories = Object.entries(summary.categoryBreakdown)
            .map(([name, amount]) => ({ name, value: amount }))
            .filter(item => item.value > 0);
          setCategoryData(categories);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [auth.user, fetchUserProfile]);

  // For the pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6666'];

  // Get budgets that are at risk (over threshold)
  const getBudgetsAtRisk = () => {
    if (!budgetData) return [];
    return budgetData.filter(budget => {
      return budget.status && budget.status.percentage >= budget.notificationThreshold;
    }).sort((a, b) => b.status.percentage - a.status.percentage);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Get amount display with proper formatting and color
  const getAmountDisplay = (amount, type) => {
    return {
      color: type === 'expense' ? 'error.main' : 'success.main',
      prefix: type === 'expense' ? '-' : '+',
      amount: amount.toFixed(2)
    };
  };

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
        <Typography variant="subtitle1" color="textSecondary">
          Here's an overview of your finances
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Income
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h4" color="success.main">
                  ${summaryData?.totalIncome?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expenses
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h4" color="error.main">
                  ${summaryData?.totalExpense?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Balance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography 
                  variant="h4" 
                  color={summaryData?.balance >= 0 ? 'success.main' : 'error.main'}
                >
                  ${Math.abs(summaryData?.balance || 0).toFixed(2)}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color={summaryData?.balance >= 0 ? 'success.main' : 'error.main'}
              >
                {summaryData?.balance >= 0 ? 'Saved' : 'Deficit'} this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Recent Activity */}
      <Grid container spacing={3}>
        {/* Expense By Category */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Expenses By Category
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {categoryData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  No expense data available yet.
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
        
        {/* Budget Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Budget Status
              </Typography>
              <Button 
                component={RouterLink} 
                to="/budgets"
                size="small"
                endIcon={<AccountBalanceIcon />}
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {budgetData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  No budgets created yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/budgets/new"
                  variant="contained"
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Create Budget
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Budgets At Risk
                </Typography>
                
                {getBudgetsAtRisk().length === 0 ? (
                  <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                    All budgets are under control!
                  </Typography>
                ) : (
                  <Box sx={{ mb: 3 }}>
                    {getBudgetsAtRisk().map((budget) => (
                      <Box key={budget._id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {budget.name}
                            </Typography>
                            {budget.status.percentage >= 100 ? (
                              <Chip label="Exceeded" size="small" color="error" />
                            ) : (
                              <Chip label="At Risk" size="small" color="warning" />
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            color={budget.status.percentage >= 100 ? 'error.main' : 'warning.main'}
                          >
                            {budget.status.percentage.toFixed(0)}%
                          </Typography>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(budget.status.percentage, 100)}
                          color={budget.status.percentage >= 100 ? 'error' : 'warning'}
                          sx={{ height: 5, borderRadius: 5 }}
                        />
                      </Box>
                    ))}
                    
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button
                        component={RouterLink}
                        to="/budgets/recommendations"
                        size="small"
                        color="primary"
                      >
                        Get Recommendations
                      </Button>
                    </Box>
                  </Box>
                )}
                
                <Button
                  component={RouterLink}
                  to="/budgets/new"
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Budget
                </Button>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Saving Goals or Tips */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Financial Insights
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {summaryData?.balance !== undefined && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Savings Rate
                  </Typography>
                  
                  {summaryData.totalIncome > 0 ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {summaryData.balance >= 0 ? (
                          <ArrowUpwardIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <ArrowDownwardIcon color="error" sx={{ mr: 1 }} />
                        )}
                        <Typography 
                          variant="body1" 
                          color={summaryData.balance >= 0 ? 'success.main' : 'error.main'}
                        >
                          {Math.abs((summaryData.balance / summaryData.totalIncome * 100)).toFixed(0)}% of income
                          {summaryData.balance >= 0 ? ' saved' : ' deficit'}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {summaryData.balance >= 0 ? (
                          summaryData.balance / summaryData.totalIncome >= 0.2 ? (
                            'Excellent! You\'re saving more than 20% of your income.'
                          ) : (
                            'Try to increase your savings to at least 20% of your income.'
                          )
                        ) : (
                          'You\'re spending more than you earn. Review your budget to reduce expenses.'
                        )}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No income recorded yet for this period.
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Quick Tips
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Track all expenses, no matter how small"
                        secondary="Small expenses add up over time"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Review your budget weekly"
                        secondary="Regular reviews help you stay on track"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Set up automatic savings transfers"
                        secondary="Pay yourself first to build savings"
                      />
                    </ListItem>
                  </List>
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