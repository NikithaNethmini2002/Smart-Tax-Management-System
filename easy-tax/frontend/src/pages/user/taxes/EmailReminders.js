import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addMonths, isAfter, isBefore, getDate } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import axios from 'axios'; // Make sure axios is imported

// Utility function to safely parse numeric values from possibly non-numeric inputs
const safeParseFloat = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  
  // If it's already a number, return it
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point
    // This handles currency formats like "$1,234.56"
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // For other types, try to convert to string and parse
  try {
    const stringValue = String(value);
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.warn('Failed to parse numeric value:', value);
    return 0;
  }
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const EmailReminders = ({ taxData }) => {
  const theme = useTheme();
  const emailFormRef = useRef();
  
  // Create a placeholder tax data if none is provided
  const [internalTaxData, setInternalTaxData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculatedTaxes, setCalculatedTaxes] = useState({ salary: [], business: [] });
  
  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Import the service and fetch transactions
        const TransactionService = await import('../../../services/transaction.service').then(m => m.default);
        const transactionsData = await TransactionService.getAllTransactions();
        // Only consider income transactions
        const incomeTransactions = transactionsData.filter(tx => tx.type === 'income');
        setTransactions(incomeTransactions);
        console.log('📊 Loaded transactions for tax calculations:', incomeTransactions.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions for tax calculations:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);
  
  // Calculate taxes when both tax data and transactions are available
  useEffect(() => {
    if (transactions.length > 0) {
      calculateTaxes();
    }
  }, [internalTaxData, transactions, taxData]);
  
  // Main function to calculate taxes based on transactions
  const calculateTaxes = () => {
    const dataSource = internalTaxData.length > 0 ? internalTaxData : taxData;
    
    if (!dataSource || !Array.isArray(dataSource) || dataSource.length === 0) {
      console.log('📊 No tax data available for calculation');
      setCalculatedTaxes({ salary: [], business: [] });
      return;
    }
    
    try {
      console.log('📊 Calculating taxes using transactions and tax data...');
      
      // Calculate Salary taxes
      const salaryItems = dataSource
        .filter(tax => 
          tax.category && 
          typeof tax.category === 'string' && 
          tax.category.toLowerCase().includes('salary')
        )
        .map(tax => {
          // Find the specific transaction based on subCategory (description)
          const specificTransaction = transactions.find(
            tx => tx.category === tax.category && tx.description === tax.subCategory
          );
          
          const incomeAmount = specificTransaction ? specificTransaction.amount : 0;
          const taxAmount = (incomeAmount * safeParseFloat(tax.percentage)) / 100;
          
          console.log(`📊 Salary Tax: ${tax.title}`, {
            category: tax.category,
            subCategory: tax.subCategory,
            matchingTransaction: specificTransaction ? 'found' : 'not found',
            transactionAmount: specificTransaction ? specificTransaction.amount : 0,
            percentage: tax.percentage,
            calculatedTax: taxAmount
          });
          
          return {
            ...tax,
            incomeAmount,
            taxAmount,
            transactionDescription: tax.subCategory || 'N/A'
          };
        });
      
      // Calculate Business taxes
      const businessItems = dataSource
        .filter(tax => 
          tax.category && 
          typeof tax.category === 'string' && 
          tax.category.toLowerCase().includes('business')
        )
        .map(tax => {
          // Find the specific transaction based on subCategory (description)
          const specificTransaction = transactions.find(
            tx => tx.category === tax.category && tx.description === tax.subCategory
          );
          
          const incomeAmount = specificTransaction ? specificTransaction.amount : 0;
          const taxAmount = (incomeAmount * safeParseFloat(tax.percentage)) / 100;
          
          console.log(`📊 Business Tax: ${tax.title}`, {
            category: tax.category,
            subCategory: tax.subCategory,
            matchingTransaction: specificTransaction ? 'found' : 'not found',
            transactionAmount: specificTransaction ? specificTransaction.amount : 0,
            percentage: tax.percentage,
            calculatedTax: taxAmount
          });
          
          return {
            ...tax,
            incomeAmount,
            taxAmount,
            transactionDescription: tax.subCategory || 'N/A'
          };
        });
      
      // Update the calculated taxes
      setCalculatedTaxes({
        salary: salaryItems,
        business: businessItems
      });
      
      console.log('📊 Calculated taxes:', {
        salary: salaryItems,
        business: businessItems,
        totalSalary: salaryItems.reduce((sum, item) => sum + item.taxAmount, 0),
        totalBusiness: businessItems.reduce((sum, item) => sum + item.taxAmount, 0),
      });
      
    } catch (error) {
      console.error('Error calculating taxes:', error);
      setCalculatedTaxes({ salary: [], business: [] });
    }
  };
  
  // The new functions we're keeping
  const getTotalSalaryTax = () => {
    return calculatedTaxes.salary.reduce((sum, tax) => sum + tax.taxAmount, 0);
  };
  
  const getTotalBusinessTax = () => {
    return calculatedTaxes.business.reduce((sum, tax) => sum + tax.taxAmount, 0);
  };

  useEffect(() => {
    // Check if we have valid tax data from props
    const isValidTaxData = taxData && Array.isArray(taxData) && taxData.length > 0;
    
    if (isValidTaxData) {
      console.log('📊 Using tax data from props:', taxData.length, 'items');
      setInternalTaxData(taxData);
    } else {
      console.warn('⚠️ Invalid tax data from props, using fallback data');
      
      // Create some fallback tax data for testing/debugging
      const fallbackData = [
        {
          id: 'fallback-1',
          title: 'Income Tax',
          category: 'Salary',
          incomeAmount: 5000,
          percentage: 20,
          subCategory: 'Monthly Salary'
        },
        {
          id: 'fallback-2',
          title: 'Business Tax',
          category: 'Business',
          incomeAmount: 3000,
          percentage: 15,
          subCategory: 'Consulting Income'
        }
      ];
      
      // Only use fallback in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Setting fallback tax data for development testing');
        setInternalTaxData(fallbackData);
      }
    }
  }, [taxData]);
  
  // Previous useEffect for extensive tax data logging
  useEffect(() => {
    const dataToLog = internalTaxData.length > 0 ? internalTaxData : taxData;
    
    console.log('📊 Tax data for analysis:', dataToLog);
    // Rest of your logging code...
    // ... existing debug code ...
  }, [internalTaxData, taxData]);
  
  // Log tax data when component receives props
  useEffect(() => {
    console.log('📊 EmailReminders received taxData:', taxData);
    
    // Check if taxData is what we expect
    if (!taxData) {
      console.warn('⚠️ taxData is null or undefined');
    } else if (!Array.isArray(taxData)) {
      console.warn('⚠️ taxData is not an array:', typeof taxData);
    } else if (taxData.length === 0) {
      console.warn('⚠️ taxData array is empty');
    } else {
      // Log extensive details about tax structure
      console.log('📊 TAX DATA STRUCTURE CHECK:');
      const sampleTax = taxData[0];
      console.log('📊 First tax item:', sampleTax);
      
      // Check expected properties
      const missingProps = [];
      ['title', 'category', 'incomeAmount', 'percentage'].forEach(prop => {
        if (!(prop in sampleTax)) {
          missingProps.push(prop);
        }
      });
      
      if (missingProps.length > 0) {
        console.warn(`⚠️ Tax object is missing properties: ${missingProps.join(', ')}`);
      }
      
      // Log all categories to help with debugging
      const categoriesMap = {};
      taxData.forEach(tax => {
        if (tax.category) {
          if (!categoriesMap[tax.category]) {
            categoriesMap[tax.category] = 0;
          }
          categoriesMap[tax.category]++;
        }
      });
      console.log('📊 Tax categories distribution:', categoriesMap);
      
      // Check income and percentage values
      const hasValidIncomeAmount = taxData.some(tax => 
        tax.incomeAmount && !isNaN(parseFloat(tax.incomeAmount)) && parseFloat(tax.incomeAmount) > 0
      );
      
      const hasValidPercentage = taxData.some(tax => 
        tax.percentage && !isNaN(parseFloat(tax.percentage)) && parseFloat(tax.percentage) > 0
      );
      
      if (!hasValidIncomeAmount) {
        console.warn('⚠️ No tax items have valid income amounts > 0');
      }
      
      if (!hasValidPercentage) {
        console.warn('⚠️ No tax items have valid percentage values > 0');
      }
      
      // Log the full tax data for analysis
      console.log('📊 Complete tax data:', JSON.stringify(taxData, null, 2));
    }
  }, [taxData]);
  
  // Check localStorage contents immediately
  useEffect(() => {
    console.log('📢 INITIAL LOCALSTORAGE CHECK:');
    console.log('📢 reminderEmails:', localStorage.getItem('reminderEmails'));
    console.log('📢 reminderSettings:', localStorage.getItem('reminderSettings'));
    console.log('📢 reminderHistory:', localStorage.getItem('reminderHistory'));
  }, []);
  
  // Get initial values from localStorage or use defaults
  const initialEmails = (() => {
    try {
      const stored = localStorage.getItem('reminderEmails');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse reminderEmails from localStorage:', e);
      return [];
    }
  })();
  
  const initialSettings = (() => {
    try {
      const stored = localStorage.getItem('reminderSettings');
      if (!stored) return { active: true, sendDate: 28 };
      const parsed = JSON.parse(stored);
      return {
        active: typeof parsed.active === 'boolean' ? parsed.active : true,
        sendDate: parsed.sendDate ? parseInt(parsed.sendDate) : 28
      };
    } catch (e) {
      console.error('Failed to parse reminderSettings from localStorage:', e);
      return { active: true, sendDate: 28 };
    }
  })();
  
  // Initialize states with values from localStorage
  const [emails, setEmails] = useState(initialEmails);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');
  const [activeReminders, setActiveReminders] = useState(initialSettings.active);
  const [sendDate, setSendDate] = useState(initialSettings.sendDate); // Use parsed settings
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [reminderPreview, setReminderPreview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState(null);
  const [reminderHistory, setReminderHistory] = useState([]);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Check if localStorage is available and working
  const isLocalStorageAvailable = () => {
    const testKey = '__test_storage__';
    try {
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('localStorage is not available:', e);
      return false;
    }
  };

  // Helper function to safely save to localStorage
  const safelySetItem = (key, value) => {
    if (!isLocalStorageAvailable()) {
      console.error('localStorage is not available, cannot save', key);
      return false;
    }
    
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      
      // Verify the data was saved correctly
      const savedValue = localStorage.getItem(key);
      if (!savedValue) {
        console.error('Failed to save data to localStorage for key:', key);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving data to localStorage for key ${key}:`, error);
      return false;
    }
  };

  // Helper function to safely get from localStorage
  const safelyGetItem = (key, defaultValue = null) => {
    if (!isLocalStorageAvailable()) {
      console.error('localStorage is not available, cannot retrieve', key);
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error retrieving data from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  };

  // Load saved reminder history from localStorage only
  useEffect(() => {
    try {
      console.log('Loading reminder history from localStorage');
      const savedHistory = localStorage.getItem('reminderHistory');
      
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setReminderHistory(parsedHistory);
        }
      } else {
        // Demo history data if none exists
        const demoHistory = [
          {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            recipients: ['demo@example.com'],
            status: 'sent'
          }
        ];
        setReminderHistory(demoHistory);
        localStorage.setItem('reminderHistory', JSON.stringify(demoHistory));
      }
    } catch (error) {
      console.error('Error loading reminder history from localStorage:', error);
      setReminderHistory([]);
    }
  }, []);

  // Save emails to localStorage whenever they change
  useEffect(() => {
    if (emails === initialEmails) {
      // Skip initial render to avoid unnecessary saves
      return;
    }
    
    try {
      console.log('💾 Saving emails to localStorage:', emails);
      localStorage.setItem('reminderEmails', JSON.stringify(emails));
      
      // Verify save
      const saved = localStorage.getItem('reminderEmails');
      const parsedSaved = saved ? JSON.parse(saved) : [];
      console.log('✅ Verified emails saved:', parsedSaved);
      
      if (!saved) {
        console.error('Failed to save emails to localStorage - verification failed');
        showSnackbar('Failed to save email settings', 'error');
      }
    } catch (error) {
      console.error('Error saving emails to localStorage:', error);
      showSnackbar('Failed to save email settings', 'error');
    }
  }, [emails, initialEmails]);

  // Save reminder settings to localStorage
  useEffect(() => {
    if (activeReminders === initialSettings.active && sendDate === initialSettings.sendDate) {
      // Skip initial render to avoid unnecessary saves
      return;
    }
    
    try {
      const settings = {
        active: activeReminders,
        sendDate: parseInt(sendDate) // Ensure sendDate is saved as a number
      };
      console.log('💾 Saving reminder settings to localStorage:', settings);
      localStorage.setItem('reminderSettings', JSON.stringify(settings));
      
      // Verify save
      const saved = localStorage.getItem('reminderSettings');
      const parsedSaved = saved ? JSON.parse(saved) : {};
      console.log('✅ Verified settings saved:', parsedSaved);
      
      if (!saved) {
        console.error('Failed to save settings to localStorage - verification failed');
        showSnackbar('Failed to save reminder settings', 'error');
      }
    } catch (error) {
      console.error('Error saving reminder settings to localStorage:', error);
      showSnackbar('Failed to save reminder settings', 'error');
    }
  }, [activeReminders, sendDate, initialSettings]);

  // Add a verification effect to check localStorage consistency on every render
  useEffect(() => {
    const verifyStorageConsistency = () => {
      try {
        // Check if email state matches localStorage
        const storedEmails = localStorage.getItem('reminderEmails');
        const parsedEmails = storedEmails ? JSON.parse(storedEmails) : null;
        const emailsMatch = parsedEmails && 
          JSON.stringify(emails) === JSON.stringify(parsedEmails);
        
        // Check if settings state matches localStorage
        const storedSettings = localStorage.getItem('reminderSettings');
        const parsedSettings = storedSettings ? JSON.parse(storedSettings) : null;
        const settingsMatch = parsedSettings && 
          parsedSettings.active === activeReminders && 
          parseInt(parsedSettings.sendDate) === parseInt(sendDate);
        
        // Log any inconsistencies for debugging
        if (!emailsMatch) {
          console.warn('⚠️ Storage inconsistency detected: emails state doesn\'t match localStorage', {
            stateEmails: emails,
            storedEmails: parsedEmails
          });
        }
        
        if (!settingsMatch) {
          console.warn('⚠️ Storage inconsistency detected: settings state doesn\'t match localStorage', {
            stateSettings: { active: activeReminders, sendDate },
            storedSettings: parsedSettings
          });
        }
      } catch (error) {
        console.error('Error verifying storage consistency:', error);
      }
    };
    
    // Run the verification only in development mode
    if (process.env.NODE_ENV === 'development') {
      verifyStorageConsistency();
    }
  });

  const handleEmailChange = (e) => {
    setEmailInput(e.target.value);
    setError('');
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    
    // Validation
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }
    
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      setError('This email is already in the list');
      return;
    }
    
    // Add email
    const updatedEmails = [...emails, trimmedEmail];
    setEmails(updatedEmails);
    setEmailInput('');
    
    // Explicitly save to localStorage immediately
    try {
      localStorage.setItem('reminderEmails', JSON.stringify(updatedEmails));
      console.log('✅ Email added and saved to localStorage:', updatedEmails);
    } catch (error) {
      console.error('Failed to save updated emails to localStorage:', error);
    }
    
    // Show success message
    showSnackbar('Email added successfully', 'success');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddEmail();
    }
  };

  const handleDeleteConfirmation = (email) => {
    setEmailToDelete(email);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEmail = () => {
    if (emailToDelete) {
      const updatedEmails = emails.filter(email => email !== emailToDelete);
      setEmails(updatedEmails);
      
      // Explicitly save to localStorage immediately
      try {
        localStorage.setItem('reminderEmails', JSON.stringify(updatedEmails));
        console.log('✅ Email deleted and saved to localStorage:', updatedEmails);
      } catch (error) {
        console.error('Failed to save updated emails to localStorage after deletion:', error);
      }
      
      showSnackbar('Email removed', 'success');
    }
    setDeleteDialogOpen(false);
    setEmailToDelete(null);
  };

  const handleToggleReminders = () => {
    const newActiveValue = !activeReminders;
    setActiveReminders(newActiveValue);
    
    // Explicitly save to localStorage immediately
    try {
      const settings = {
        active: newActiveValue,
        sendDate: parseInt(sendDate)
      };
      localStorage.setItem('reminderSettings', JSON.stringify(settings));
      console.log('✅ Reminder active status updated and saved to localStorage:', settings);
    } catch (error) {
      console.error('Failed to save updated reminder settings to localStorage:', error);
    }
    
    showSnackbar(`Reminders ${newActiveValue ? 'activated' : 'deactivated'}`, 'success');
  };

  const handleSendDateChange = (e) => {
    const newSendDate = parseInt(e.target.value);
    setSendDate(newSendDate);
    
    // Explicitly save to localStorage immediately
    try {
      const settings = {
        active: activeReminders,
        sendDate: newSendDate
      };
      localStorage.setItem('reminderSettings', JSON.stringify(settings));
      console.log('✅ Send date updated and saved to localStorage:', settings);
    } catch (error) {
      console.error('Failed to save updated reminder settings to localStorage:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Generate PDF for attachment
  const generateTaxReportPDF = async () => {
    try {
      // Log tax data available for PDF generation
      const dataSource = internalTaxData.length > 0 ? internalTaxData : taxData;
      console.log('📊 Tax data for PDF generation:', dataSource);
      
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add report title
      doc.setFontSize(18);
      doc.setTextColor(25, 118, 210); // #1976d2 primary color
      const title = `Tax Report - ${format(new Date(), 'MMMM yyyy')}`;
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Add current date
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() - 15, 10, { align: 'right' });
      
      // Add tax summary section
      doc.setFontSize(14);
      doc.setTextColor(25, 118, 210);
      doc.text('Tax Summary', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      
      // Calculate tax summaries
      const salaryTaxAmount = getTotalSalaryTax();
      const businessTaxAmount = getTotalBusinessTax();
      
      const totalTax = salaryTaxAmount + businessTaxAmount;
      
      console.log('📊 Tax amounts for PDF:', {
        salary: salaryTaxAmount,
        business: businessTaxAmount,
        total: totalTax
      });
      
      // Add summary data
      doc.autoTable({
        startY: 40,
        head: [['Category', 'Amount ($)', 'Percentage']],
        body: [
          ['Salary Tax', salaryTaxAmount.toFixed(2), `${(salaryTaxAmount / totalTax * 100).toFixed(1)}%`],
          ['Business Tax', businessTaxAmount.toFixed(2), `${(businessTaxAmount / totalTax * 100).toFixed(1)}%`],
          ['Total Tax', totalTax.toFixed(2), '100%']
        ],
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
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 10, right: 15, bottom: 15, left: 15 }
      });
      
      // Add detailed tax section
      const detailY = doc.autoTable.previous.finalY + 10;
      doc.setFontSize(14);
      doc.setTextColor(25, 118, 210);
      doc.text('Detailed Tax Information', doc.internal.pageSize.getWidth() / 2, detailY, { align: 'center' });
      
      // Prepare detailed data
      const detailedTableData = dataSource.map(tax => [
        tax.title,
        tax.category,
        `${tax.percentage}%`,
        tax.subCategory || 'N/A',
        (tax.incomeAmount || 0).toFixed(2),
        ((tax.incomeAmount || 0) * tax.percentage / 100).toFixed(2)
      ]);
      
      // Add detailed data table
      doc.autoTable({
        startY: detailY + 10,
        head: [['Tax Name', 'Category', 'Rate', 'Transaction', 'Income ($)', 'Tax Amount ($)']],
        body: detailedTableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          overflow: 'linebreak',
          cellPadding: 3,
          fontSize: 8
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
      
      // Convert to blob and return
      const pdfBlob = doc.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  // Add test function to directly check API connectivity
  const testEmailApi = async () => {
    try {
      console.log('Testing email API connection...');
      const response = await axios.get('/api/email/test');
      console.log('Email API test response:', response.data);
      showSnackbar('Email API connection successful', 'success');
      return true;
    } catch (error) {
      console.error('Email API test failed:', error);
      showSnackbar(`Email API connection failed: ${error.message}`, 'error');
      return false;
    }
  };

  // Modified send email function to first test API connectivity
  const handleSendTestEmail = async () => {
    if (emails.length === 0) {
      setError('Add at least one email to send a test reminder');
      return;
    }

    setSending(true);
    setEmailError(''); // Clear any previous errors
    
    try {
      // First test API connectivity
      const apiIsWorking = await testEmailApi();
      if (!apiIsWorking) {
        throw new Error('Could not connect to email service. Please try again later.');
      }

      // Calculate tax summaries for the email template
      const salaryTaxAmount = getTotalSalaryTax();
      const businessTaxAmount = getTotalBusinessTax();
      
      // Create a simple array to track successful sends
      const successfulSends = [];
      
      // Send email to each recipient
      for (const email of emails) {
        try {
          // Prepare email data
          const emailData = {
            to: email,
            toName: email.split('@')[0],
            monthYear: format(new Date(), 'MMMM yyyy'),
            salaryTax: `$${salaryTaxAmount.toFixed(2)}`,
            businessTax: `$${businessTaxAmount.toFixed(2)}`,
            totalTax: `$${(salaryTaxAmount + businessTaxAmount).toFixed(2)}`
          };
          
          console.log('Sending email to:', email);
          
          // Make API request to our backend
          const response = await axios.post('/api/email/send-reminder', emailData);
          
          if (response.data.success) {
            successfulSends.push(email);
            console.log('Email sent successfully to:', email);
          } else {
            throw new Error(response.data.error || 'Failed to send email');
          }
        } catch (err) {
          console.error(`Failed to send email to ${email}:`, err);
          throw err; // Re-throw to handle outside the loop
        }
      }
      
      // All emails sent successfully
      // Update reminder history
      const newHistory = [
        {
          date: new Date().toISOString(),
          recipients: [...successfulSends],
          status: 'sent',
          type: 'test'
        },
        ...reminderHistory
      ];
      
      setReminderHistory(newHistory);
      safelySetItem('reminderHistory', newHistory);
      
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
      
      showSnackbar('Test reminder sent successfully', 'success');
    } catch (error) {
      console.error('Error sending test email:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send email';
      showSnackbar(`Failed to send email: ${errorMessage}`, 'error');
      setEmailError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy - h:mm a');
  };

  const getNextReminderDate = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    // Calculate this month's reminder date
    const reminderDate = new Date(thisYear, thisMonth, sendDate);
    
    // If today is after this month's reminder date, move to next month
    if (isAfter(today, reminderDate)) {
      return format(addMonths(reminderDate, 1), 'MMMM d, yyyy');
    }
    
    return format(reminderDate, 'MMMM d, yyyy');
  };

  const getDaysUntilReminder = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    // Calculate this month's reminder date
    let reminderDate = new Date(thisYear, thisMonth, sendDate);
    
    // If today is after this month's reminder date, move to next month
    if (isAfter(today, reminderDate)) {
      reminderDate = addMonths(reminderDate, 1);
    }
    
    // Calculate days difference
    const diffTime = Math.abs(reminderDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const renderReminderPreviewDialog = () => {
    // Debug tax data to diagnose the issue
    const dataSource = internalTaxData.length > 0 ? internalTaxData : taxData;
    console.log('📊 Tax data for preview:', dataSource);
    
    // Calculate taxes using our robust helper functions
    const totalSalaryTax = getTotalSalaryTax();
    const totalBusinessTax = getTotalBusinessTax();
    const totalTax = totalSalaryTax + totalBusinessTax;
    
    console.log('📊 Calculated tax amounts:', {
      salary: totalSalaryTax,
      business: totalBusinessTax,
      total: totalTax
    });
    
    return (
      <Dialog 
        open={reminderPreview} 
        onClose={() => setReminderPreview(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmailIcon sx={{ mr: 1 }} />
            Tax Reminder Email Preview
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#f8f9fa', 
            borderBottom: '1px solid #eee'
          }}>
            <Typography variant="subtitle2" color="text.secondary">From:</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Easy-Tax App &lt;notifications@easy-tax.app&gt;</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">To:</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {emails.length > 0 ? emails.join(', ') : 'No recipients added'}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Monthly Tax Reminder - {format(new Date(), 'MMMM yyyy')}</Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Typography variant="body1" paragraph>
              Hello,
            </Typography>
            
            <Typography variant="body1" paragraph>
              This is your monthly tax reminder from Easy-Tax. We're sending this to help you stay on top of your tax obligations for the current period.
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>Tax Summary:</strong>
            </Typography>
            
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              mb: 2,
              border: '1px solid #e0e0e0'
            }}>
              {dataSource && dataSource.length > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="primary">
                      Salary Taxes:
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      ${totalSalaryTax.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="primary">
                      Business Taxes:
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      ${totalBusinessTax.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="subtitle2" color="primary" fontWeight="bold">
                        Total Taxes:
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="error">
                        ${totalTax.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tax data available. Please add tax information in the app.
                </Typography>
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              Thank you for using Easy-Tax to manage your taxes.
            </Typography>
            
            <Typography variant="body1">
              Best regards,<br />
              The Easy-Tax Team
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setReminderPreview(false)}>
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Reset localStorage for our specific keys (for troubleshooting)
  const resetLocalStorage = () => {
    try {
      console.log('🧹 Resetting localStorage for reminder data...');
      
      // Remove our specific keys
      localStorage.removeItem('reminderEmails');
      localStorage.removeItem('reminderSettings');
      localStorage.removeItem('reminderHistory');
      
      console.log('🧹 localStorage after removal:');
      console.log('reminderEmails:', localStorage.getItem('reminderEmails'));
      console.log('reminderSettings:', localStorage.getItem('reminderSettings'));
      console.log('reminderHistory:', localStorage.getItem('reminderHistory'));
      
      // Set default values
      setEmails([]);
      setActiveReminders(true);
      setSendDate(28);
      setReminderHistory([]);
      
      // Save defaults back to localStorage directly
      localStorage.setItem('reminderEmails', JSON.stringify([]));
      localStorage.setItem('reminderSettings', JSON.stringify({ active: true, sendDate: 28 }));
      localStorage.setItem('reminderHistory', JSON.stringify([]));
      
      console.log('✅ Default values set in localStorage:');
      console.log('reminderEmails:', localStorage.getItem('reminderEmails'));
      console.log('reminderSettings:', localStorage.getItem('reminderSettings'));
      console.log('reminderHistory:', localStorage.getItem('reminderHistory'));
      
      showSnackbar('Settings reset successfully', 'success');
      
      // Force a reload of the page to ensure everything is reset properly
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Error resetting localStorage:', error);
      showSnackbar('Failed to reset settings', 'error');
      return false;
    }
  };

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Left Column - Add Emails */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1 }} color="primary" />
              Reminder Recipients
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <TextField
                  fullWidth
                  label="Add Email Address"
                  variant="outlined"
                  value={emailInput}
                  onChange={handleEmailChange}
                  onKeyPress={handleKeyPress}
                  error={!!error}
                  helperText={error}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddEmail}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add email addresses that should receive tax reminders
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Recipient List {emails.length > 0 && `(${emails.length})`}
            </Typography>
            
            {emails.length > 0 ? (
              <List sx={{ 
                bgcolor: '#f5f5f5', 
                borderRadius: 1,
                mb: 2,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                {emails.map((email, index) => (
                  <ListItem key={index} divider={index !== emails.length - 1}>
                    <ListItemText 
                      primary={email} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        sx: { wordBreak: 'break-all' }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDeleteConfirmation(email)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ mb: 2 }}
              >
                No email recipients added yet
              </Alert>
            )}
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={() => setReminderPreview(true)}
              sx={{ mt: 2 }}
              disabled={emails.length === 0}
            >
              Preview Reminder Email
            </Button>
          </Paper>
        </Grid>
        
        {/* Right Column - Reminder Settings */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Reminder Settings Section */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                mb: 3
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} color="secondary" />
                Reminder Settings
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeReminders}
                      onChange={handleToggleReminders}
                      color="secondary"
                    />
                  }
                  label="Enable Monthly Reminders"
                />
                <Typography variant="body2" color="text.secondary">
                  When enabled, tax reminders will be sent automatically every month
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="reminder-day-label">Send reminder on day</InputLabel>
                  <Select
                    labelId="reminder-day-label"
                    id="reminder-day"
                    value={sendDate}
                    onChange={handleSendDateChange}
                    label="Send reminder on day"
                    disabled={!activeReminders}
                  >
                    {[...Array(28)].map((_, index) => (
                      <MenuItem key={index + 1} value={index + 1}>
                        {index + 1}{getOrdinalSuffix(index + 1)} day of each month
                      </MenuItem>
                    ))}
                    <MenuItem value={28}>28th day of each month</MenuItem>
                    <MenuItem value={29}>Last day of each month</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Card variant="outlined" sx={{ mb: 3, bgcolor: activeReminders ? '#f0f7ff' : '#f5f5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon color={activeReminders ? "primary" : "disabled"} sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Next Reminder
                    </Typography>
                  </Box>
                  
                  {activeReminders ? (
                    <>
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: theme.palette.primary.main }}>
                        {getNextReminderDate()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={`${getDaysUntilReminder()} days remaining`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {emails.length} {emails.length === 1 ? 'recipient' : 'recipients'}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Reminders are currently disabled
                    </Typography>
                  )}
                </CardContent>
              </Card>
              
              {emailError && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 2, mb: 2 }}
                  icon={<ErrorIcon />}
                >
                  <Typography variant="subtitle2">Error sending email:</Typography>
                  <Typography variant="body2">{emailError}</Typography>
                </Alert>
              )}
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                onClick={handleSendTestEmail}
                disabled={emails.length === 0 || testEmailSent || sending}
                fullWidth
              >
                {testEmailSent ? (
                  <>
                    <CheckIcon sx={{ mr: 1 }} />
                    Test Email Sent
                  </>
                ) : sending ? (
                  'Sending...'
                ) : (
                  'Send Tax Reminder Now'
                )}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={testEmailApi}
                sx={{ mt: 2 }}
                fullWidth
              >
                Test Email API Connection
              </Button>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" color="info" sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Emails are sent via Gmail. To see your emails, make sure to set up the Gmail credentials in the backend.
                </Typography>
              </Box>
            </Paper>

            {/* Reminder History Section - Separate Paper Component */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.info.main}`,
                flex: 1
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Reminder History
              </Typography>
              
              {reminderHistory.length > 0 ? (
                <List dense sx={{ 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  {reminderHistory.map((reminder, index) => (
                    <ListItem key={index} divider={index !== reminderHistory.length - 1}>
                      <ListItemText
                        primary={formatDate(reminder.date)}
                        secondary={`Sent to ${reminder.recipients.length} ${reminder.recipients.length === 1 ? 'recipient' : 'recipients'}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                      <Chip 
                        label={reminder.type === 'test' ? 'Test' : 'Scheduled'} 
                        size="small"
                        color={reminder.type === 'test' ? 'secondary' : 'primary'}
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No reminder history yet</Alert>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={resetLocalStorage}
                  startIcon={<DeleteIcon />}
                >
                  Reset All Email Settings
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
      
      {/* Delete Email Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Email Address?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {emailToDelete} from the reminder list?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteEmail} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reminder Email Preview Dialog */}
      {renderReminderPreviewDialog()}
      
      {/* Success/Info Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Helper function to get ordinal suffix for day number
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export default EmailReminders; 