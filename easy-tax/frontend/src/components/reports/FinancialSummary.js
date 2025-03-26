import React from 'react';
import { Box, Grid, Paper, Typography, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

const SummaryCard = ({ title, value, previousValue, change, isCurrency = true }) => {
  const isPositiveChange = change >= 0;
  const changeText = change !== null 
    ? `${isPositiveChange ? '+' : ''}${isCurrency ? '' : change.toFixed(1) + '%'} ${isCurrency ? '(' + formatPercentage(change) + ')' : ''}`
    : 'N/A';
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div" gutterBottom>
        {isCurrency ? formatCurrency(value) : formatPercentage(value)}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {change !== null && (
          isPositiveChange ? 
            <TrendingUpIcon color="success" fontSize="small" /> : 
            <TrendingDownIcon color="error" fontSize="small" />
        )}
        <Typography 
          variant="body2" 
          color={change === null ? 'text.secondary' : (isPositiveChange ? 'success.main' : 'error.main')}
          sx={{ ml: 0.5 }}
        >
          {changeText}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Previous: {isCurrency ? formatCurrency(previousValue) : formatPercentage(previousValue)}
      </Typography>
    </Paper>
  );
};

const CategoryPieChart = ({ categories, title }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const data = categories.map((category, index) => ({
    name: category.category,
    value: category.amount,
    percentage: category.percentage
  }));
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      
      <Box sx={{ height: 300, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(name) => name}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

const FinancialSummary = ({ data }) => {
  if (!data || !data.summary) {
    return (
      <Typography variant="body1" color="text.secondary">
        No financial summary data available.
      </Typography>
    );
  }
  
  const { summary, topExpenseCategories, period } = data;
  
  const periodLabels = {
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    year: 'Last Year'
  };
  
  const currentExpenses = summary.current.expense;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Financial Summary - {periodLabels[period] || 'Custom Period'}
      </Typography>
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
        {new Date(data.timeRanges.current.start).toLocaleDateString()} to {new Date(data.timeRanges.current.end).toLocaleDateString()}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Income" 
            value={summary.current.income} 
            previousValue={summary.previous.income} 
            change={summary.changes.income} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Expenses" 
            value={summary.current.expense} 
            previousValue={summary.previous.expense} 
            change={summary.changes.expense} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Balance" 
            value={summary.current.balance} 
            previousValue={summary.previous.balance} 
            change={summary.changes.balance} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Savings Rate" 
            value={summary.current.savingsRate} 
            previousValue={summary.previous.savingsRate} 
            change={summary.changes.savingsRate}
            isCurrency={false}
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CategoryPieChart 
            categories={topExpenseCategories} 
            title="Top Expense Categories" 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Top Expense Details
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {topExpenseCategories.map((category, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">
                      {category.category}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(category.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {category.count} transactions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.percentage.toFixed(1)}% of total
                    </Typography>
                  </Box>
                  {index < topExpenseCategories.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Typography variant="subtitle2">
                Total Expenses: {formatCurrency(currentExpenses)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.current.transactionCount} transactions in this period
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialSummary; 