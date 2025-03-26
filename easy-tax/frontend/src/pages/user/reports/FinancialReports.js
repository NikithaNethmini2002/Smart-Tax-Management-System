import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Tabs, 
  Tab, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { format, subMonths, subWeeks, subYears } from 'date-fns';

import UserLayout from '../../../components/UserLayout';
import reportService from '../../../services/report.service';
import SpendingTrendsChart from '../../../components/reports/SpendingTrendsChart';
import IncomeExpenseChart from '../../../components/reports/IncomeExpenseChart';
import CategoryBreakdownChart from '../../../components/reports/CategoryBreakdownChart';
import FinancialSummary from '../../../components/reports/FinancialSummary';

const FinancialReports = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Filter states
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [period, setPeriod] = useState('month');
  const [transactionType, setTransactionType] = useState('expense');
  const [startDate, setStartDate] = useState(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState(new Date());
  
  // Data states
  const [spendingTrendsData, setSpendingTrendsData] = useState(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState(null);
  const [categoryBreakdownData, setCategoryBreakdownData] = useState(null);
  const [financialSummaryData, setFinancialSummaryData] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Preset date range options
  const dateRangePresets = [
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Last 3 months', value: 'last3months' },
    { label: 'Last 6 months', value: 'last6months' },
    { label: 'Last year', value: 'lastyear' },
    { label: 'Custom', value: 'custom' }
  ];
  
  const [dateRangePreset, setDateRangePreset] = useState('last6months');
  
  // Apply date range preset
  useEffect(() => {
    if (dateRangePreset === 'custom') return;
    
    const now = new Date();
    let start;
    
    switch (dateRangePreset) {
      case 'last7days':
        start = subWeeks(now, 1);
        break;
      case 'last30days':
        start = subMonths(now, 1);
        break;
      case 'last3months':
        start = subMonths(now, 3);
        break;
      case 'last6months':
        start = subMonths(now, 6);
        break;
      case 'lastyear':
        start = subYears(now, 1);
        break;
      default:
        start = subMonths(now, 6);
    }
    
    setStartDate(start);
    setEndDate(now);
  }, [dateRangePreset]);
  
  // Load data based on current tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Format dates for API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        
        console.log(`Fetching data for tab: ${tabValue}, timeFrame: ${timeFrame}, period: ${period}`);
        console.log(`Date range: ${formattedStartDate} to ${formattedEndDate}`);
        
        switch (tabValue) {
          case 0: // Summary
            console.log('Fetching financial summary data...');
            const summaryData = await reportService.getFinancialSummary({ period });
            console.log('Financial summary data:', summaryData);
            setFinancialSummaryData(summaryData);
            break;
          case 1: // Spending Trends
            console.log('Fetching spending trends data...');
            const trendsData = await reportService.getSpendingTrends({ 
              timeFrame, 
              startDate: formattedStartDate, 
              endDate: formattedEndDate 
            });
            console.log('Spending trends data:', trendsData);
            if (!trendsData || !trendsData.data) {
              console.error('Received invalid spending trends data:', trendsData);
              setError('Received invalid spending trends data from the server.');
            } else {
              setSpendingTrendsData(trendsData);
            }
            break;
          case 2: // Income vs Expense
            console.log('Fetching income vs expense data...');
            const incomeExpenseData = await reportService.getIncomeVsExpense({ 
              timeFrame, 
              startDate: formattedStartDate, 
              endDate: formattedEndDate 
            });
            console.log('Income vs expense data:', incomeExpenseData);
            setIncomeExpenseData(incomeExpenseData);
            break;
          case 3: // Category Breakdown
            console.log('Fetching category breakdown data...');
            const breakdownData = await reportService.getCategoryBreakdown({ 
              type: transactionType, 
              startDate: formattedStartDate, 
              endDate: formattedEndDate 
            });
            console.log('Category breakdown data:', breakdownData);
            setCategoryBreakdownData(breakdownData);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tabValue, timeFrame, period, transactionType, startDate, endDate]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter components based on active tab
  const renderFilters = () => {
    switch (tabValue) {
      case 0: // Summary
        return (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={period}
                  label="Time Period"
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <MenuItem value="week">Last 7 days</MenuItem>
                  <MenuItem value="month">Last 30 days</MenuItem>
                  <MenuItem value="year">Last year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1: // Spending Trends
      case 2: // Income vs Expense
        return (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Time Frame</InputLabel>
                <Select
                  value={timeFrame}
                  label="Time Frame"
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRangePreset}
                  label="Date Range"
                  onChange={(e) => setDateRangePreset(e.target.value)}
                >
                  {dateRangePresets.map(preset => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {dateRangePreset === 'custom' && (
              <>
                <Grid item xs={12} sm={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      minDate={startDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
          </Grid>
        );
      case 3: // Category Breakdown
        return (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={transactionType}
                  label="Transaction Type"
                  onChange={(e) => setTransactionType(e.target.value)}
                >
                  <MenuItem value="expense">Expenses</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRangePreset}
                  label="Date Range"
                  onChange={(e) => setDateRangePreset(e.target.value)}
                >
                  {dateRangePresets.map(preset => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {dateRangePreset === 'custom' && (
              <>
                <Grid item xs={12} sm={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      minDate={startDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
          </Grid>
        );
      default:
        return null;
    }
  };
  
  // Render report content based on active tab
  const renderReportContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }
    
    switch (tabValue) {
      case 0: // Summary
        return financialSummaryData ? (
          <FinancialSummary data={financialSummaryData} />
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No financial summary data available.
          </Typography>
        );
      case 1: // Spending Trends
        return spendingTrendsData ? (
          <SpendingTrendsChart data={spendingTrendsData} />
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No spending trends data available. Try selecting a different time period.
          </Typography>
        );
      case 2: // Income vs Expense
        return incomeExpenseData ? (
          <IncomeExpenseChart data={incomeExpenseData} />
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No income vs expense data available. Try selecting a different time period.
          </Typography>
        );
      case 3: // Category Breakdown
        return categoryBreakdownData ? (
          <CategoryBreakdownChart data={categoryBreakdownData} />
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No category breakdown data available. Try selecting a different time period.
          </Typography>
        );
      default:
        return null;
    }
  };
  
  return (
    <UserLayout title="Financial Reports">
      <Box sx={{ maxWidth: 1200, mx: 'auto', my: 2 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Financial Reports
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Analyze your financial data with interactive reports and visualizations.
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Financial Summary" />
              <Tab label="Spending Trends" />
              <Tab label="Income vs Expense" />
              <Tab label="Category Breakdown" />
            </Tabs>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            {renderFilters()}
          </Box>
          
          <Box>
            {renderReportContent()}
          </Box>
        </Paper>
      </Box>
    </UserLayout>
  );
};

export default FinancialReports; 