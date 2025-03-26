import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, ToggleButtonGroup, ToggleButton, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const formatPercentage = (value) => {
  return `${value?.toFixed(1) || 0}%`;
};

const CHART_COLORS = {
  'Food & Dining': '#FF8042',
  'Transportation': '#0088FE',
  'Entertainment': '#FFBB28',
  'Housing': '#00C49F',
  'Utilities': '#8884D8',
  'Healthcare': '#4CAF50',
  'Personal Care': '#9C27B0',
  'Education': '#E91E63',
  'Shopping': '#795548',
  'Travel': '#607D8B',
  'Gifts & Donations': '#FFC107',
  'Investments': '#3F51B5',
  'Taxes': '#F44336',
  'Other': '#9E9E9E',
  'total': '#1976D2'
};

// Get color for a category, or generate one if not in our predefined colors
const getCategoryColor = (category) => {
  return COLORS[category] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
};

const COLORS = Object.values(CHART_COLORS);

const SpendingTrendsChart = ({ data }) => {
  const [chartType, setChartType] = useState('stacked');
  const [focusCategory, setFocusCategory] = useState('all');
  
  console.log('SpendingTrendsChart component received data:', data);
  
  // Check if data exists and has the required properties
  if (!data) {
    console.error('No data provided to SpendingTrendsChart');
    return (
      <Typography variant="body1" color="text.secondary">
        No spending trends data available for the selected period.
      </Typography>
    );
  }
  
  if (!data.categories) {
    console.error('No categories found in data:', data);
    return (
      <Typography variant="body1" color="text.secondary">
        No spending categories available. Please add some expense transactions.
      </Typography>
    );
  }
  
  if (!data.data) {
    console.error('No data points found in data:', data);
    return (
      <Typography variant="body1" color="text.secondary">
        No spending data available for the selected period.
      </Typography>
    );
  }
  
  // If we have categories but no data points, show a message
  if (data.categories.length === 0 || data.data.length === 0) {
    console.log('Categories or data array is empty:', {
      categoryCount: data.categories?.length || 0,
      dataPointCount: data.data?.length || 0
    });
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Spending Trends
        </Typography>
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
          {new Date(data.startDate).toLocaleDateString()} to {new Date(data.endDate).toLocaleDateString()}
        </Typography>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No spending data available for the selected time period.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try selecting a different time range or add expense transactions.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  const { timeFrame, data: chartData, comparison, categories } = data;
  
  console.log('Chart data details:', {
    timeFrame,
    categoryCount: categories.length,
    dataPointCount: chartData.length,
    categories,
    firstDataPoint: chartData[0],
    lastDataPoint: chartData[chartData.length - 1]
  });
  
  // Check if at least one period has data (amount > 0)
  const hasActualData = chartData.some(period => {
    const hasData = categories.some(category => period[category] > 0);
    return hasData || period.total > 0;
  });
  
  console.log('hasActualData:', hasActualData);
  
  // If all periods have zero values for all categories
  if (!hasActualData) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Spending Trends
        </Typography>
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
          {new Date(data.startDate).toLocaleDateString()} to {new Date(data.endDate).toLocaleDateString()}
        </Typography>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No expenses recorded in any category during this period.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try selecting a different time range or add expense transactions.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  const handleCategoryChange = (event) => {
    setFocusCategory(event.target.value);
  };
  
  // Format time period labels based on timeFrame
  const formatXAxisLabel = (value) => {
    if (!value) return '';
    
    switch (timeFrame) {
      case 'weekly':
        return `Week ${value.split('-W')[1]}`;
      case 'monthly':
        const parts = value.split('-');
        return `${new Date(0, parts[1]-1).toLocaleString('default', { month: 'short' })} ${parts[0]}`;
      case 'quarterly':
        const qParts = value.split('-Q');
        return `Q${qParts[1]} ${qParts[0]}`;
      case 'yearly':
        return value;
      default:
        return value;
    }
  };
  
  // Render trend comparison section
  const renderComparison = () => {
    if (!comparison) return null;
    
    const { overall, categories: compCategories } = comparison;
    
    // Show the top 3 categories with biggest changes
    const topChanges = Object.entries(compCategories)
      .map(([category, data]) => ({ 
        category, 
        currentAmount: data.currentAmount,
        previousAmount: data.previousAmount,
        percentChange: data.percentChange 
      }))
      .filter(item => item.percentChange !== null)
      .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
      .slice(0, 3);
    
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
          Spending Trend Insights
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Your total spending 
            {overall.percentChange > 0 
              ? ` increased by ${formatPercentage(overall.percentChange)}` 
              : ` decreased by ${formatPercentage(Math.abs(overall.percentChange))}`} 
            compared to the previous period.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Notable Changes:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            {topChanges.map((item, index) => (
              <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                <strong>{item.category}:</strong> {item.percentChange > 0 ? 'Increased' : 'Decreased'} by {formatPercentage(Math.abs(item.percentChange))}
                {" "}
                ({formatCurrency(item.previousAmount)} → {formatCurrency(item.currentAmount)})
              </Typography>
            ))}
          </Box>
        </Box>
      </Paper>
    );
  };
  
  // Render charts based on selected chart type
  const renderChart = () => {
    switch (chartType) {
      case 'stacked':
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
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={formatXAxisLabel}
              />
              <Legend />
              {categories.map((category, index) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="1"
                  fill={CHART_COLORS[category] || COLORS[index % COLORS.length]}
                  stroke={CHART_COLORS[category] || COLORS[index % COLORS.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
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
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={formatXAxisLabel}
              />
              <Legend />
              {focusCategory === 'all' 
                ? categories.map((category, index) => (
                    <Bar 
                      key={category}
                      dataKey={category}
                      fill={CHART_COLORS[category] || COLORS[index % COLORS.length]}
                    />
                  ))
                : (
                    focusCategory === 'total' 
                      ? <Bar dataKey="total" fill={CHART_COLORS.total} />
                      : <Bar dataKey={focusCategory} fill={CHART_COLORS[focusCategory] || COLORS[0]} />
                  )
              }
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
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={formatXAxisLabel}
              />
              <Legend />
              {focusCategory === 'all' 
                ? categories.map((category, index) => (
                    <Line 
                      key={category}
                      type="monotone"
                      dataKey={category}
                      stroke={CHART_COLORS[category] || COLORS[index % COLORS.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))
                : (
                    focusCategory === 'total' 
                      ? <Line type="monotone" dataKey="total" stroke={CHART_COLORS.total} activeDot={{ r: 8 }} />
                      : <Line type="monotone" dataKey={focusCategory} stroke={CHART_COLORS[focusCategory] || COLORS[0]} activeDot={{ r: 8 }} />
                  )
              }
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  // Render category breakdown pie chart (for most recent period)
  const renderCategoryBreakdown = () => {
    if (!chartData || chartData.length === 0) return null;
    
    // Get the most recent period data
    const latestPeriod = chartData[chartData.length - 1];
    
    // Format data for pie chart
    const pieData = categories.map(category => ({
      name: category,
      value: latestPeriod[category] || 0
    })).filter(item => item.value > 0);
    
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Latest Period Category Breakdown
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom>
          {formatXAxisLabel(latestPeriod.period)}
        </Typography>
        
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, textAlign: 'center' }}>
          Total: {formatCurrency(latestPeriod.total || 0)}
        </Typography>
      </Paper>
    );
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Spending Trends
      </Typography>
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
        {new Date(data.startDate).toLocaleDateString()} to {new Date(data.endDate).toLocaleDateString()}
      </Typography>
      
      {/* Display comparison data */}
      {renderComparison()}
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
          >
            <ToggleButton value="stacked" aria-label="stacked area chart">
              Stacked
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              Bar
            </ToggleButton>
            <ToggleButton value="line" aria-label="line chart">
              Line
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        
        {chartType !== 'stacked' && (
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={focusCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="total">Total</MenuItem>
                <Divider />
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Spending Trends
            </Typography>
            
            {renderChart()}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {renderCategoryBreakdown()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpendingTrendsChart; 