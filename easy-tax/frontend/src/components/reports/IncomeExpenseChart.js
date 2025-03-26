import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

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

const IncomeExpenseChart = ({ data }) => {
  const [chartType, setChartType] = useState('bar');
  
  // Debug logging
  useEffect(() => {
    console.log('IncomeExpenseChart - Received data:', data);
    
    if (!data) {
      console.log('IncomeExpenseChart - No data provided');
      return;
    }

    if (!data.data || data.data.length === 0) {
      console.log('IncomeExpenseChart - Empty data array');
      return;
    }

    console.log(`IncomeExpenseChart - Timeframe: ${data.timeFrame}, Periods: ${data.data.length}`);
    console.log(`IncomeExpenseChart - Date range: ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`);
    console.log('IncomeExpenseChart - Totals:', data.totals);
    
    // Check if we have actual data (not just zeros)
    const hasActualData = data.data.some(period => period.income > 0 || period.expense > 0);
    console.log(`IncomeExpenseChart - Has actual data: ${hasActualData}`);
  }, [data]);
  
  if (!data || !data.data) {
    return (
      <Typography variant="body1" color="text.secondary">
        No income vs expense data available for the selected period.
      </Typography>
    );
  }
  
  // Handle empty data array
  if (data.data.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No financial data found for the selected time period.
      </Typography>
    );
  }
  
  // Check if we have any non-zero data
  const hasData = data.data.some(item => item.income > 0 || item.expense > 0);
  if (!hasData) {
    return (
      <Typography variant="body1" color="text.secondary">
        No income or expense transactions recorded during this period.
      </Typography>
    );
  }
  
  const { timeFrame, data: chartData, totals } = data;
  
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  // Format time period labels based on timeFrame
  const formatXAxisLabel = (value) => {
    if (!value) return '';
    
    switch (timeFrame) {
      case 'weekly':
        return `Week ${value.split('-W')[1]}`;
      case 'monthly':
        const parts = value.split('-');
        if (parts.length < 2) return value;
        return `${new Date(0, parts[1]-1).toLocaleString('default', { month: 'short' })} ${parts[0]}`;
      case 'quarterly':
        const qParts = value.split('-Q');
        if (qParts.length < 2) return value;
        return `Q${qParts[1]} ${qParts[0]}`;
      case 'yearly':
        return value;
      default:
        return value;
    }
  };
  
  // Calculate monthly averages
  const calculateAverages = () => {
    const incomeAvg = chartData.length > 0 ? totals.income / chartData.length : 0;
    const expenseAvg = chartData.length > 0 ? totals.expense / chartData.length : 0;
    const balanceAvg = chartData.length > 0 ? totals.balance / chartData.length : 0;
    
    return {
      incomeAvg,
      expenseAvg,
      balanceAvg
    };
  };
  
  const averages = calculateAverages();
  
  // Calculate savings rate
  const savingsRate = totals.income > 0 
    ? (totals.income - totals.expense) / totals.income * 100 
    : 0;
  
  // Render summary stats
  const renderSummary = () => {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Income vs Expense Summary
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Income
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatCurrency(totals.income)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg: {formatCurrency(averages.incomeAvg)} per period
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Expenses
            </Typography>
            <Typography variant="h6" color="error.main">
              {formatCurrency(totals.expense)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg: {formatCurrency(averages.expenseAvg)} per period
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Net Balance
            </Typography>
            <Typography variant="h6" color={totals.balance >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(totals.balance)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Savings Rate: {formatPercentage(savingsRate)}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1">
          During this period, you have {totals.balance >= 0 ? 'saved' : 'overspent'} {formatCurrency(Math.abs(totals.balance))} 
          ({totals.balance >= 0 ? 'positive' : 'negative'} balance).
        </Typography>
        
        {totals.balance < 0 && (
          <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
            You're spending more than you earn. Consider reviewing your expenses to identify areas for potential savings.
          </Typography>
        )}
        
        {totals.balance > 0 && savingsRate < 10 && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            Your savings rate is less than 10%. Consider setting aside more for savings and emergencies.
          </Typography>
        )}
        
        {totals.balance > 0 && savingsRate >= 20 && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            Great job! You're saving more than 20% of your income.
          </Typography>
        )}
      </Paper>
    );
  };
  
  // Render charts based on selected chart type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatXAxisLabel}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={formatXAxisLabel}
              />
              <Legend />
              <Bar name="Income" dataKey="income" fill="#4CAF50" />
              <Bar name="Expenses" dataKey="expense" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatXAxisLabel}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={formatXAxisLabel}
              />
              <Legend />
              <Line name="Income" type="monotone" dataKey="income" stroke="#4CAF50" activeDot={{ r: 8 }} />
              <Line name="Expenses" type="monotone" dataKey="expense" stroke="#F44336" activeDot={{ r: 8 }} />
              <Line name="Balance" type="monotone" dataKey="balance" stroke="#1976D2" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatXAxisLabel}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={formatXAxisLabel}
              />
              <Legend />
              <Area name="Income" type="monotone" dataKey="income" fill="#4CAF50" stroke="#4CAF50" fillOpacity={0.3} />
              <Area name="Expenses" type="monotone" dataKey="expense" fill="#F44336" stroke="#F44336" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatXAxisLabel}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={formatXAxisLabel}
              />
              <Legend />
              <Bar name="Income" dataKey="income" fill="#4CAF50" />
              <Bar name="Expenses" dataKey="expense" fill="#F44336" />
              <Line name="Balance" type="monotone" dataKey="balance" stroke="#1976D2" />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  // Render monthly details in table form
  const renderPeriodDetails = () => {
    // Sort periods for display, most recent first
    const sortedData = [...chartData].sort((a, b) => {
      // For the table view, we want to show most recent periods first
      const aParts = a.period.split('-');
      const bParts = b.period.split('-');
      
      // Compare by year first
      const yearA = parseInt(aParts[0], 10);
      const yearB = parseInt(bParts[0], 10);
      if (yearA !== yearB) return yearB - yearA;
      
      // Then by period indicator (month, week, quarter)
      if (aParts.length === 1) return 0; // yearly, just compare years
      
      if (aParts[1].startsWith('W')) {
        // Weekly format: YYYY-WNN
        return parseInt(bParts[1].substring(1), 10) - parseInt(aParts[1].substring(1), 10);
      } else if (aParts[1].startsWith('Q')) {
        // Quarterly format: YYYY-QN
        return parseInt(bParts[1].substring(1), 10) - parseInt(aParts[1].substring(1), 10);
      } else {
        // Monthly format: YYYY-MM
        return parseInt(bParts[1], 10) - parseInt(aParts[1], 10);
      }
    });
    
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Period-by-Period Breakdown
        </Typography>
        
        <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
          <Box sx={{ minWidth: 650 }}>
            <Grid container sx={{ 
              fontWeight: 'bold', 
              p: 1, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 1
            }}>
              <Grid item xs={3}>
                <Typography variant="subtitle2">Period</Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2">Income</Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2">Expenses</Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2">Balance</Typography>
              </Grid>
            </Grid>
            
            <Divider />
            
            {sortedData.map((period, index) => (
              <React.Fragment key={index}>
                <Grid container sx={{ p: 1 }}>
                  <Grid item xs={3}>
                    <Typography variant="body2">{formatXAxisLabel(period.period)}</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">{formatCurrency(period.income)}</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">{formatCurrency(period.expense)}</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: period.balance >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {formatCurrency(period.balance)}
                    </Typography>
                  </Grid>
                </Grid>
                {index < sortedData.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Paper>
    );
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Income vs Expenses
      </Typography>
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
        {new Date(data.startDate).toLocaleDateString()} to {new Date(data.endDate).toLocaleDateString()}
      </Typography>
      
      {/* Display summary stats */}
      {renderSummary()}
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
          >
            <ToggleButton value="bar" aria-label="bar chart">
              Bar
            </ToggleButton>
            <ToggleButton value="line" aria-label="line chart">
              Line
            </ToggleButton>
            <ToggleButton value="area" aria-label="area chart">
              Area
            </ToggleButton>
            <ToggleButton value="composed" aria-label="composed chart">
              Composed
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Income vs Expenses
            </Typography>
            
            {renderChart()}
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          {renderPeriodDetails()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default IncomeExpenseChart; 