import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  FilterAlt,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as LineChartIcon,
  DataUsage as DonutChartIcon,
  CalendarMonth,
  DateRange,
  PriorityHighOutlined,
  FileDownload
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart, 
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Label
} from 'recharts';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  format, 
  isWithinInterval,
  subMonths,
  subWeeks,
  getMonth,
  getYear
} from 'date-fns';
import TransactionService from '../../../services/transaction.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Chart colors
const COLORS = [
  '#1976d2', '#2e7d32', '#d32f2f', '#9c27b0', '#ed6c02', 
  '#0288d1', '#388e3c', '#d33a2f', '#7b1fa2', '#f57c00'
];

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: <BarChartIcon /> },
  { value: 'pie', label: 'Pie Chart', icon: <PieChartIcon /> },
  { value: 'line', label: 'Line Chart', icon: <LineChartIcon /> },
  { value: 'donut', label: 'Donut Chart', icon: <DonutChartIcon /> }
];

const TaxCharts = ({ taxData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [salaryTaxes, setSalaryTaxes] = useState([]);
  const [businessTaxes, setBusinessTaxes] = useState([]);
  const [chartType, setChartType] = useState('bar');
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  // Add a ref for the chart container
  const chartRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const transactionsData = await TransactionService.getAllTransactions();
        // Only consider income transactions
        const incomeTransactions = transactionsData.filter(tx => tx.type === 'income');
        setTransactions(incomeTransactions);
        setFilteredTransactions(incomeTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Apply time-based filtering when filter type or dates change
  useEffect(() => {
    applyTimeFilter();
  }, [filterType, selectedMonth, selectedWeek, transactions]);

  // Filter transactions based on selected time period
  const applyTimeFilter = () => {
    if (!transactions.length) return;

    let start, end;
    let filtered;

    switch (filterType) {
      case 'month':
        start = startOfMonth(selectedMonth);
        end = endOfMonth(selectedMonth);
        setDateRange({ start, end });
        break;
      case 'week':
        start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
        end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
        setDateRange({ start, end });
        break;
      case 'all':
      default:
        setDateRange({ start: null, end: null });
        setFilteredTransactions(transactions);
        return;
    }

    // Filter transactions within the date range
    filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return isWithinInterval(txDate, { start, end });
    });

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    // Calculate taxes based on specific transaction descriptions
    if (taxData.length > 0 && filteredTransactions.length > 0) {
      // Get Salary taxes
      const salaryItems = taxData
        .filter(tax => tax.category.toLowerCase().includes('salary'))
        .map(tax => {
          // Find the specific transaction based on subCategory (description)
          const specificTransaction = filteredTransactions.find(
            tx => tx.category === tax.category && tx.description === tax.subCategory
          );
          
          const incomeAmount = specificTransaction ? specificTransaction.amount : 0;
          const taxAmount = (incomeAmount * tax.percentage) / 100;
          
          return {
            ...tax,
            incomeAmount,
            taxAmount,
            transactionDescription: tax.subCategory || 'N/A'
          };
        });
      
      // Get Business taxes
      const businessItems = taxData
        .filter(tax => tax.category.toLowerCase().includes('business'))
        .map(tax => {
          // Find the specific transaction based on subCategory (description)
          const specificTransaction = filteredTransactions.find(
            tx => tx.category === tax.category && tx.description === tax.subCategory
          );
          
          const incomeAmount = specificTransaction ? specificTransaction.amount : 0;
          const taxAmount = (incomeAmount * tax.percentage) / 100;
          
          return {
            ...tax,
            incomeAmount,
            taxAmount,
            transactionDescription: tax.subCategory || 'N/A'
          };
        });
      
      setSalaryTaxes(salaryItems);
      setBusinessTaxes(businessItems);
    } else {
      setSalaryTaxes([]);
      setBusinessTaxes([]);
    }
  }, [taxData, filteredTransactions]);

  const handleFilterTypeChange = (event, newType) => {
    if (newType !== null) {
      setFilterType(newType);
    }
  };

  const handleMonthChange = (event) => {
    const [year, month] = event.target.value.split('-');
    const newDate = new Date(parseInt(year), parseInt(month) - 1);
    setSelectedMonth(newDate);
  };

  const handleWeekChange = (date) => {
    setSelectedWeek(date);
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Generate options for month selection dropdown
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let i = 0; i < 12; i++) {
      const date = subMonths(currentDate, i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthStr = String(month + 1).padStart(2, '0');
      
      options.push({
        value: `${year}-${monthStr}`,
        label: `${months[month]} ${year}`
      });
    }
    
    return options;
  };

  // Generate options for week selection dropdown
  const getWeekOptions = () => {
    const options = [];
    const currentDate = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 12; i++) {
      const date = subWeeks(currentDate, i);
      const startOfTheWeek = startOfWeek(date, { weekStartsOn: 1 });
      const endOfTheWeek = endOfWeek(date, { weekStartsOn: 1 });
      
      // Format dates manually to avoid recursive format calls
      const startYear = startOfTheWeek.getFullYear();
      const startMonth = startOfTheWeek.getMonth();
      const startDay = startOfTheWeek.getDate();
      const startMonthStr = String(startMonth + 1).padStart(2, '0');
      const startDayStr = String(startDay).padStart(2, '0');
      
      const endYear = endOfTheWeek.getFullYear();
      const endMonth = endOfTheWeek.getMonth();
      const endDay = endOfTheWeek.getDate();
      
      options.push({
        value: `${startYear}-${startMonthStr}-${startDayStr}`,
        label: `${months[startMonth]} ${startDay} - ${months[endMonth]} ${endDay}, ${endYear}`
      });
    }
    
    return options;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Format date range for display
  const getDateRangeLabel = () => {
    if (filterType === 'all' || !dateRange.start || !dateRange.end) {
      return 'All Time';
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const start = dateRange.start;
    const end = dateRange.end;
    
    return `${months[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  };

  // Prepare data for charts
  const prepareTaxComparisonData = () => {
    const salaryTaxSum = salaryTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);
    const businessTaxSum = businessTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);
    const totalTax = salaryTaxSum + businessTaxSum;
    
    return [
      { name: 'Salary', value: salaryTaxSum, percentage: salaryTaxSum / totalTax * 100 },
      { name: 'Business', value: businessTaxSum, percentage: businessTaxSum / totalTax * 100 }
    ];
  };

  const prepareDetailedTaxData = () => {
    // Combine salary and business taxes
    return [
      ...salaryTaxes.map(tax => ({
        name: tax.title,
        category: 'Salary',
        value: tax.taxAmount,
        description: tax.transactionDescription
      })),
      ...businessTaxes.map(tax => ({
        name: tax.title,
        category: 'Business',
        value: tax.taxAmount,
        description: tax.transactionDescription
      }))
    ].sort((a, b) => b.value - a.value); // Sort by value descending
  };

  const prepareRateVsAmountData = () => {
    return [
      ...salaryTaxes.map(tax => ({
        name: tax.title,
        category: 'Salary',
        rate: tax.percentage,
        amount: tax.taxAmount,
        description: tax.transactionDescription
      })),
      ...businessTaxes.map(tax => ({
        name: tax.title,
        category: 'Business',
        rate: tax.percentage,
        amount: tax.taxAmount,
        description: tax.transactionDescription
      }))
    ];
  };

  const prepareIncomeVsTaxData = () => {
    // Calculate totals for salary and business
    const salaryIncome = salaryTaxes.reduce((sum, tax) => sum + tax.incomeAmount, 0);
    const salaryTaxAmount = salaryTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);
    
    const businessIncome = businessTaxes.reduce((sum, tax) => sum + tax.incomeAmount, 0);
    const businessTaxAmount = businessTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);
    
    return [
      { name: 'Salary', income: salaryIncome, tax: salaryTaxAmount, remaining: salaryIncome - salaryTaxAmount },
      { name: 'Business', income: businessIncome, tax: businessTaxAmount, remaining: businessIncome - businessTaxAmount }
    ];
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1.5, boxShadow: 3, maxWidth: 220 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label || payload[0].name}
          </Typography>
          
          {payload.map((entry, index) => {
            let valueLabel = entry.value;
            
            // Format as currency if needed
            if (entry.dataKey === 'value' || entry.dataKey === 'amount' || 
                entry.dataKey === 'income' || entry.dataKey === 'tax' || 
                entry.dataKey === 'remaining') {
              valueLabel = formatCurrency(entry.value);
            } else if (entry.dataKey === 'percentage') {
              valueLabel = `${entry.value.toFixed(1)}%`;
            } else if (entry.dataKey === 'rate') {
              valueLabel = `${entry.value}%`;
            }
            
            return (
              <Box key={`tooltip-item-${index}`} sx={{ mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: entry.color,
                      borderRadius: '50%',
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ ml: 3 }}>
                  {valueLabel}
                </Typography>
              </Box>
            );
          })}
          
          {/* Show description if available */}
          {payload[0].payload.description && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Transaction: {payload[0].payload.description}
              </Typography>
            </>
          )}
        </Card>
      );
    }
    return null;
  };

  const renderChart = () => {
    const taxComparisonData = prepareTaxComparisonData();
    const detailedTaxData = prepareDetailedTaxData();
    const rateVsAmountData = prepareRateVsAmountData();
    const incomeVsTaxData = prepareIncomeVsTaxData();
    
    // If there's no data to show
    if (
      (detailedTaxData.length === 0) || 
      (taxComparisonData.every(item => item.value === 0))
    ) {
      return (
        <Alert 
          severity="info" 
          icon={<PriorityHighOutlined />}
          sx={{ mt: 2 }}
        >
          No tax data available for the selected time period.
        </Alert>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <Grid container spacing={3}>
            {/* Bar chart showing tax amounts by category */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Tax Amounts by Category
                </Typography>
                <Box sx={{ height: 400, mt: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={incomeVsTaxData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`} 
                        width={70}
                      >
                        <Label 
                          value="Amount ($)" 
                          angle={-90} 
                          position="insideLeft" 
                          style={{ textAnchor: 'middle' }} 
                        />
                      </YAxis>
                      <Tooltip content={customTooltip} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#4caf50" />
                      <Bar dataKey="tax" name="Tax" fill="#f44336" />
                      <Bar dataKey="remaining" name="After Tax" fill="#2196f3" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
            
            {/* Bar chart showing individual tax details */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Individual Tax Breakdown
                </Typography>
                <Box sx={{ height: 400, mt: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={detailedTaxData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150} 
                        tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                      />
                      <Tooltip content={customTooltip} />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Tax Amount" 
                        fill="#1976d2"
                        background={{ fill: '#eee' }}
                      >
                        {detailedTaxData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.category === 'Salary' ? '#1976d2' : '#2e7d32'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        );
        
      case 'pie':
        return (
          <Grid container spacing={3}>
            {/* Pie chart showing tax distribution by category */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Tax Distribution by Category
                </Typography>
                <Box sx={{ height: 400, mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taxComparisonData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      >
                        {taxComparisonData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#1976d2' : '#2e7d32'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={customTooltip} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
            
            {/* Pie chart showing detailed tax breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Individual Tax Breakdown
                </Typography>
                <Box sx={{ height: 400, mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={detailedTaxData}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 30 : 60}
                        outerRadius={isMobile ? 80 : 130}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {detailedTaxData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={customTooltip} />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={isMobile ? { fontSize: '10px' } : {}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        );
        
      case 'line':
        return (
          <Grid container spacing={3}>
            {/* Line chart showing tax rate vs tax amount */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Tax Rate vs Tax Amount
                </Typography>
                <Box sx={{ height: 400, mt: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={rateVsAmountData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                        tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tickFormatter={(value) => `$${value}`}
                      >
                        <Label 
                          value="Tax Amount ($)" 
                          angle={-90} 
                          position="insideLeft" 
                          style={{ textAnchor: 'middle' }} 
                        />
                      </YAxis>
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tickFormatter={(value) => `${value}%`}
                      >
                        <Label 
                          value="Tax Rate (%)" 
                          angle={90} 
                          position="insideRight" 
                          style={{ textAnchor: 'middle' }} 
                        />
                      </YAxis>
                      <Tooltip content={customTooltip} />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="amount" 
                        name="Tax Amount" 
                        stroke="#1976d2" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="rate" 
                        name="Tax Rate" 
                        stroke="#f44336" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        );
        
      case 'donut':
        return (
          <Grid container spacing={3}>
            {/* Income vs Tax donut charts for Salary and Business */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Salary Income vs Tax
                </Typography>
                <Box sx={{ height: 350, mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tax', value: incomeVsTaxData[0].tax },
                          { name: 'Remaining Income', value: incomeVsTaxData[0].remaining }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 60 : 90}
                        outerRadius={isMobile ? 90 : 130}
                        fill="#8884d8"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="#f44336" />
                        <Cell fill="#4caf50" />
                      </Pie>
                      <Tooltip content={customTooltip} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Total Income: {formatCurrency(incomeVsTaxData[0].income)}
                  </Typography>
                  <Typography variant="body2" color="error">
                    Tax: {formatCurrency(incomeVsTaxData[0].tax)} 
                    ({incomeVsTaxData[0].income > 0 
                      ? ((incomeVsTaxData[0].tax / incomeVsTaxData[0].income) * 100).toFixed(1) 
                      : 0}%)
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Business Income vs Tax
                </Typography>
                <Box sx={{ height: 350, mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tax', value: incomeVsTaxData[1].tax },
                          { name: 'Remaining Income', value: incomeVsTaxData[1].remaining }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 60 : 90}
                        outerRadius={isMobile ? 90 : 130}
                        fill="#8884d8"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="#f44336" />
                        <Cell fill="#4caf50" />
                      </Pie>
                      <Tooltip content={customTooltip} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Total Income: {formatCurrency(incomeVsTaxData[1].income)}
                  </Typography>
                  <Typography variant="body2" color="error">
                    Tax: {formatCurrency(incomeVsTaxData[1].tax)} 
                    ({incomeVsTaxData[1].income > 0 
                      ? ((incomeVsTaxData[1].tax / incomeVsTaxData[1].income) * 100).toFixed(1) 
                      : 0}%)
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            {/* Area chart showing income allocation */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Income Allocation Overview
                </Typography>
                <Box sx={{ height: 400, mt: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={incomeVsTaxData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      stackOffset="expand"
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}>
                        <Label 
                          value="Percentage" 
                          angle={-90} 
                          position="insideLeft" 
                          style={{ textAnchor: 'middle' }} 
                        />
                      </YAxis>
                      <Tooltip 
                        formatter={(value, name) => [
                          `${(value * 100).toFixed(2)}%`, 
                          name === 'tax' ? 'Tax' : 'After-Tax Income'
                        ]} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="tax" 
                        stackId="1" 
                        stroke="#f44336" 
                        fill="#f44336" 
                        name="Tax"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="remaining" 
                        stackId="1" 
                        stroke="#4caf50" 
                        fill="#4caf50" 
                        name="After-Tax Income"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        );
        
      default:
        return (
          <Alert severity="warning">
            Unknown chart type selected.
          </Alert>
        );
    }
  };

  // Function to generate and download the PDF report
  const generatePDF = async () => {
    try {
      setDownloading(true);
      
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add report title
      doc.setFontSize(18);
      doc.setTextColor(25, 118, 210); // #1976d2 primary color
      const title = `Tax Report - ${getDateRangeLabel()}`;
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Add chart type subtitle
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      const chartTypeLabel = CHART_TYPES.find(type => type.value === chartType)?.label || 'Chart';
      doc.text(chartTypeLabel, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
      
      // Add current date
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() - 15, 10, { align: 'right' });
      
      // Capture the chart as image if it exists
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { 
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = doc.internal.pageSize.getWidth() - 30; // 15mm margins on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight);
        
        // Add table data based on chart type
        let tableData = [];
        let tableColumns = [];
        
        switch (chartType) {
          case 'bar':
            // For bar chart, show income, tax, and remaining amounts
            tableColumns = [
              { header: 'Category', dataKey: 'name' },
              { header: 'Income ($)', dataKey: 'income' },
              { header: 'Tax ($)', dataKey: 'tax' },
              { header: 'Remaining ($)', dataKey: 'remaining' },
              { header: 'Tax Rate (%)', dataKey: 'taxRate' }
            ];
            
            tableData = prepareIncomeVsTaxData().map(item => ({
              ...item,
              income: item.income.toFixed(2),
              tax: item.tax.toFixed(2),
              remaining: item.remaining.toFixed(2),
              taxRate: item.income > 0 ? ((item.tax / item.income) * 100).toFixed(2) : '0.00'
            }));
            break;
            
          case 'pie':
            // For pie chart showing distribution by category
            tableColumns = [
              { header: 'Category', dataKey: 'name' },
              { header: 'Tax Amount ($)', dataKey: 'value' },
              { header: 'Percentage (%)', dataKey: 'percentage' }
            ];
            
            tableData = prepareTaxComparisonData().map(item => ({
              ...item,
              value: item.value.toFixed(2),
              percentage: item.percentage.toFixed(2)
            }));
            break;
            
          case 'line':
            // For line chart showing tax rate vs tax amount
            tableColumns = [
              { header: 'Tax Name', dataKey: 'name' },
              { header: 'Category', dataKey: 'category' },
              { header: 'Tax Rate (%)', dataKey: 'rate' },
              { header: 'Tax Amount ($)', dataKey: 'amount' },
              { header: 'Transaction', dataKey: 'description' }
            ];
            
            tableData = prepareRateVsAmountData().map(item => ({
              ...item,
              amount: item.amount.toFixed(2)
            }));
            break;
            
          case 'donut':
            // For donut chart showing income allocation
            tableColumns = [
              { header: 'Category', dataKey: 'name' },
              { header: 'Income ($)', dataKey: 'income' },
              { header: 'Tax ($)', dataKey: 'tax' },
              { header: 'After Tax ($)', dataKey: 'remaining' },
              { header: 'Tax Rate (%)', dataKey: 'taxRate' }
            ];
            
            tableData = prepareIncomeVsTaxData().map(item => ({
              ...item,
              income: item.income.toFixed(2),
              tax: item.tax.toFixed(2),
              remaining: item.remaining.toFixed(2),
              taxRate: item.income > 0 ? ((item.tax / item.income) * 100).toFixed(2) : '0.00'
            }));
            break;
            
          default:
            tableColumns = [
              { header: 'No data available', dataKey: 'message' }
            ];
            tableData = [{ message: 'No data available for this chart type' }];
        }
        
        // Add table title
        const tableY = imgHeight + 45; // Position below the chart
        doc.setFontSize(14);
        doc.setTextColor(25, 118, 210);
        doc.text('Detailed Data', doc.internal.pageSize.getWidth() / 2, tableY, { align: 'center' });
        
        // Generate the table
        doc.autoTable({
          startY: tableY + 5,
          head: [tableColumns.map(col => col.header)],
          body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
          theme: 'grid',
          headStyles: { 
            fillColor: [25, 118, 210],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            overflow: 'linebreak',
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 40 } // Make first column wider for names
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          margin: { top: 10, right: 15, bottom: 15, left: 15 }
        });
        
        // Add footer with page number
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${i} of ${pageCount}`, 
            doc.internal.pageSize.getWidth() / 2, 
            doc.internal.pageSize.getHeight() - 10, 
            { align: 'center' }
          );
        }
        
        // Save the PDF
        doc.save(`tax-report-${chartType}-${new Date().toISOString().slice(0, 10)}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You might want to add some user notification here
    } finally {
      setDownloading(false);
    }
  };

  const monthOptions = getMonthOptions();
  const weekOptions = getWeekOptions();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (taxData.length === 0) {
    return (
      <Alert 
        severity="info" 
        sx={{ mb: 4 }}
        icon={<PriorityHighOutlined />}
      >
        No taxes have been added yet. Please add taxes in the "Add Tax" tab first.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Chart Selection Controls */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: 'white',
          borderLeft: '4px solid #1976d2',
          position: 'relative' // Added for absolute positioning of download button
        }}
      >
        {/* Download Report Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownload />}
          onClick={generatePDF}
          disabled={downloading || loading || taxData.length === 0}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10
          }}
        >
          {downloading ? 'Generating...' : 'Download Report'}
        </Button>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: '#1976d2' }}>
                Chart Type
              </Typography>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                aria-label="chart type"
                size={isMobile ? "small" : "medium"}
                sx={{ mb: 2 }}
              >
                {CHART_TYPES.map(type => (
                  <ToggleButton 
                    key={type.value} 
                    value={type.value} 
                    aria-label={type.label}
                  >
                    {type.icon}
                    <Typography sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                      {type.label}
                    </Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: '#9c27b0' }}>
              Time Period
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mb: 2 }}
            >
              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={handleFilterTypeChange}
                aria-label="time period filter"
                size={isMobile ? "small" : "medium"}
              >
                <ToggleButton value="all" aria-label="all time">
                  <DateRange fontSize="small" sx={{ mr: { xs: 0, sm: 0.5 } }} />
                  <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>All</Typography>
                </ToggleButton>
                <ToggleButton value="month" aria-label="month">
                  <CalendarMonth fontSize="small" sx={{ mr: { xs: 0, sm: 0.5 } }} />
                  <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>Month</Typography>
                </ToggleButton>
                <ToggleButton value="week" aria-label="week">
                  <DateRange fontSize="small" sx={{ mr: { xs: 0, sm: 0.5 } }} />
                  <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>Week</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {filterType !== 'all' && (
              <Box sx={{ mt: 2 }}>
                {filterType === 'month' && (
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel id="chart-month-select-label">Select Month</InputLabel>
                    <Select
                      labelId="chart-month-select-label"
                      id="chart-month-select"
                      value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
                      label="Select Month"
                      onChange={handleMonthChange}
                    >
                      {monthOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {filterType === 'week' && (
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel id="chart-week-select-label">Select Week</InputLabel>
                    <Select
                      labelId="chart-week-select-label"
                      id="chart-week-select"
                      value={`${selectedWeek.getFullYear()}-${String(selectedWeek.getMonth() + 1).padStart(2, '0')}-${String(selectedWeek.getDate()).padStart(2, '0')}`}
                      label="Select Week"
                      onChange={(e) => handleWeekChange(new Date(e.target.value))}
                    >
                      {weekOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Showing tax data for:
          </Typography>
          <Chip
            label={getDateRangeLabel()}
            color="secondary"
            variant="outlined"
            size="small"
          />
        </Box>
      </Paper>
      
      {/* Chart Content - Add ref to capture for PDF */}
      <Box sx={{ mb: 4 }} ref={chartRef}>
        {renderChart()}
      </Box>
    </Box>
  );
};

export default TaxCharts;