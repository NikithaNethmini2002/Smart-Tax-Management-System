import React, { useEffect } from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4CAF50', '#9C27B0', '#E91E63', '#FF5722', '#795548'];

const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Typography variant="body2" color="text.secondary">
          No category data available
        </Typography>
      </Box>
    );
  }
  
  const pieData = data.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={1}
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList dataKey="name" position="outside" />
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [formatCurrency(value), name]}
          labelFormatter={(name) => `Category: ${name}`}
        />
        <Legend 
          formatter={(value, entry, index) => (
            <span>{value} ({pieData[index]?.percentage.toFixed(1)}%)</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const CategoryBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <Typography variant="body2" color="text.secondary">
          No category data available
        </Typography>
      </Box>
    );
  }
  
  // Sort data by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart 
        data={sortedData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={formatCurrency} />
        <YAxis 
          dataKey="category" 
          type="category" 
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(name) => `Category: ${name}`}
        />
        <Bar 
          dataKey="amount" 
          fill="#82ca9d" 
          name="Amount"
          radius={[0, 4, 4, 0]}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList 
            dataKey="amount" 
            position="right" 
            formatter={formatCurrency} 
            style={{ fontSize: '11px', fill: '#666' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const CategoryBreakdownChart = ({ data }) => {
  // Debug logging
  useEffect(() => {
    console.log('CategoryBreakdownChart - Received data:', data);
    
    if (!data) {
      console.log('CategoryBreakdownChart - No data provided');
      return;
    }

    if (!data.data) {
      console.log('CategoryBreakdownChart - No data.data array');
      return;
    }

    console.log(`CategoryBreakdownChart - Type: ${data.type}, Categories: ${data.data.length}`);
    console.log(`CategoryBreakdownChart - Date range: ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`);
    console.log(`CategoryBreakdownChart - Total amount: ${data.totalAmount}`);
    
    if (data.data.length === 0) {
      console.log('CategoryBreakdownChart - Empty data array');
    } else {
      console.log('CategoryBreakdownChart - First category:', data.data[0]);
    }
  }, [data]);
  
  if (!data) {
    return (
      <Typography variant="body1" color="text.secondary">
        No category data available for the selected period.
      </Typography>
    );
  }
  
  if (!data.data) {
    return (
      <Typography variant="body1" color="text.secondary">
        Invalid category data received from server.
      </Typography>
    );
  }
  
  if (data.data.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No {data.type} categories found in the selected period. Try selecting a different time range or transaction type.
      </Typography>
    );
  }
  
  const { type, startDate, endDate, totalAmount, data: categoryData } = data;
  const typeLabel = type === 'expense' ? 'Expenses' : 'Income';
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {typeLabel} by Category
      </Typography>
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 4 }}>
        {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {typeLabel} Distribution
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <CategoryPieChart data={categoryData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {typeLabel} Ranking
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <CategoryBarChart data={categoryData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {typeLabel} Breakdown Details
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Grid container sx={{ 
                fontWeight: 'bold', 
                p: 1, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1
              }}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Category</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">Amount</Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">% of Total</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">Transactions</Typography>
                </Grid>
              </Grid>
              
              <Divider />
              
              {categoryData.map((category, index) => (
                <React.Fragment key={index}>
                  <Grid container sx={{ p: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="body2">{category.category}</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">{formatCurrency(category.amount)}</Typography>
                    </Grid>
                    <Grid item xs={2} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">{formatPercentage(category.percentage)}</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">{category.count}</Typography>
                    </Grid>
                  </Grid>
                  {index < categoryData.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              
              <Divider sx={{ mt: 1, mb: 2 }} />
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Total {typeLabel}: {formatCurrency(totalAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {categoryData.reduce((sum, cat) => sum + cat.count, 0)} transactions across {categoryData.length} categories
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CategoryBreakdownChart; 