import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import UserLayout from '../../../components/UserLayout';
import BudgetService from '../../../services/budget.service';

const BudgetRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await BudgetService.getBudgetRecommendations();
        setRecommendations(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch budget recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // For pie chart colors
  const COLORS = ['#0088FE', '#FFBB28', '#FF8042', '#00C49F', '#9966FF', '#FF6666'];

  // Format spending distribution data for pie chart
  const getSpendingDistributionData = () => {
    if (!recommendations || !recommendations.spendingDistribution) return [];
    
    return Object.entries(recommendations.spendingDistribution).map(([category, amount]) => ({
      name: category,
      value: amount
    }));
  };

  if (loading) {
    return (
      <UserLayout title="Budget Recommendations">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Budget Recommendations">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Budget Recommendations">
      <Box sx={{ maxWidth: 1200, mx: 'auto', my: 2 }}>
        <Button
          component={RouterLink}
          to="/budgets"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Budgets
        </Button>

        <Typography variant="h5" gutterBottom>
          Budget Recommendations
        </Typography>
        
        {!recommendations ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Not Enough Data
            </Typography>
            <Typography variant="body1" paragraph>
              We need more transaction history to generate personalized budget recommendations.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Continue tracking your expenses and check back later.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Spending Overview */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Spending Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Average Monthly Income
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ${recommendations.averageIncome.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Average Monthly Expenses
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      ${recommendations.averageExpenses.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" color="textSecondary">
                  Monthly Savings Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {recommendations.savingsRate >= 0 ? (
                    <ArrowUpwardIcon color="success" />
                  ) : (
                    <ArrowDownwardIcon color="error" />
                  )}
                  <Typography 
                    variant="h6" 
                    color={recommendations.savingsRate >= 0 ? 'success.main' : 'error.main'}
                  >
                    {Math.abs(recommendations.savingsRate).toFixed(1)}%
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {recommendations.savingsRate >= 20 ? (
                    'Excellent savings rate! You\'re well prepared for future needs.'
                  ) : recommendations.savingsRate >= 10 ? (
                    'Good savings rate. Consider increasing it to build more financial security.'
                  ) : recommendations.savingsRate >= 0 ? (
                    'Your savings rate is positive, but try to increase it to at least 10-20%.'
                  ) : (
                    'You\'re spending more than you earn. Review your expenses to avoid debt.'
                  )}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Spending Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Spending Distribution
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {getSpendingDistributionData().length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getSpendingDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getSpendingDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                    No spending distribution data available yet.
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Budget Recommendations */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Suggested Budget Adjustments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {recommendations.budgetSuggestions && recommendations.budgetSuggestions.length > 0 ? (
                  <List>
                    {recommendations.budgetSuggestions.map((suggestion, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {suggestion.action === 'increase' ? (
                            <TrendingUpIcon color="success" />
                          ) : (
                            <TrendingDownIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${suggestion.category}: ${suggestion.action === 'increase' ? 'Increase' : 'Decrease'} budget ${suggestion.action === 'increase' ? 'to' : 'by'} ${suggestion.amount}${suggestion.percentage ? '%' : ''}`}
                          secondary={suggestion.reason}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                    No budget adjustments recommended at this time.
                  </Typography>
                )}
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    component={RouterLink}
                    to="/budgets/new"
                    variant="contained"
                    color="primary"
                  >
                    Create New Budget
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* General Tips */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Budgeting Tips
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Follow the 50/30/20 Rule"
                      secondary="Try to allocate 50% of your income to needs, 30% to wants, and at least 20% to savings."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Regularly Review Your Budget"
                      secondary="Make it a habit to check your budget at least once a month and adjust as needed."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Build an Emergency Fund"
                      secondary="Aim to save 3-6 months of essential expenses in an easily accessible account."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Track All Expenses"
                      secondary="Record every expense, no matter how small, to get an accurate picture of your spending habits."
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </UserLayout>
  );
};

export default BudgetRecommendations; 