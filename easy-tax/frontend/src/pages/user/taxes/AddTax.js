import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Typography, 
  InputAdornment,
  FormHelperText,
  Paper,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { PercentOutlined, TitleOutlined, DescriptionOutlined, Update } from '@mui/icons-material';
import TransactionService from '../../../services/transaction.service';

const AddTax = ({ onAddTax, editingTax, onUpdateTax }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [percentage, setPercentage] = useState('');
  const [categories, setCategories] = useState(['Salary', 'Business']); // Default categories
  const [subCategories, setSubCategories] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Tax added successfully!');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch transactions to get categories and descriptions
    const fetchTransactionsData = async () => {
      try {
        setLoading(true);
        const transactions = await TransactionService.getAllTransactions();
        setAllTransactions(transactions);
        
        // Extract unique categories related to salary or business
        const uniqueCategories = [...new Set(transactions
          .filter(tx => 
            tx.type === 'income' && 
            (tx.category.toLowerCase().includes('salary') || tx.category.toLowerCase().includes('business'))
          )
          .map(tx => tx.category)
        )];
        
        // Make sure both 'Salary' and 'Business' are always available
        const combinedCategories = [...new Set([
          ...uniqueCategories,
          'Salary',
          'Business'
        ])];
        
        setCategories(combinedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setLoading(false);
      }
    };

    fetchTransactionsData();
  }, []);

  // Update sub-categories when main category changes
  useEffect(() => {
    if (category && allTransactions.length > 0) {
      // Filter transactions by selected category and get unique descriptions
      const filteredTransactions = allTransactions.filter(
        tx => tx.type === 'income' && tx.category === category
      );
      
      const uniqueDescriptions = [...new Set(
        filteredTransactions.map(tx => tx.description)
      )].filter(desc => desc && desc.trim() !== ''); // Filter out empty descriptions
      
      setSubCategories(uniqueDescriptions);
      
      // Clear the selected sub-category if it doesn't exist in the new list
      if (subCategory && !uniqueDescriptions.includes(subCategory)) {
        setSubCategory('');
      }
    } else {
      setSubCategories([]);
      setSubCategory('');
    }
  }, [category, allTransactions]);

  // Set form values when editingTax changes
  useEffect(() => {
    if (editingTax) {
      setTitle(editingTax.title);
      setDescription(editingTax.description);
      setCategory(editingTax.category);
      setSubCategory(editingTax.subCategory || '');
      setPercentage(editingTax.percentage.toString());
      setIsEditing(true);
      setSuccessMessage('Tax updated successfully!');
    } else {
      resetForm();
      setIsEditing(false);
      setSuccessMessage('Tax added successfully!');
    }
  }, [editingTax]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setSubCategory('');
    setPercentage('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!subCategory) newErrors.subCategory = 'Transaction description is required';
    
    if (!percentage) {
      newErrors.percentage = 'Percentage is required';
    } else if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      newErrors.percentage = 'Percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (isEditing && editingTax) {
        // Update existing tax
        const updatedTax = {
          ...editingTax,
          title,
          description,
          category,
          subCategory,
          percentage: Number(percentage)
        };
        
        onUpdateTax(updatedTax);
      } else {
        // Add new tax
        const newTax = {
          id: Date.now(), // Temporary ID for client-side storage
          title,
          description,
          category,
          subCategory,
          percentage: Number(percentage)
        };
        
        onAddTax(newTax);
      }
      
      // Reset form
      resetForm();
      setSuccess(true);
    }
  };

  return (
    <Box>
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: 'white'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            mb: 3, 
            fontWeight: 500,
            color: '#1976d2'
          }}
        >
          {isEditing ? 'Update Tax' : 'Add New Tax'}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleOutlined />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  margin="normal"
                  placeholder="e.g., Income Tax, Business Tax"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={!!errors.category}
                >
                  <InputLabel>Main Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Main Category"
                  >
                    <MenuItem value="" disabled>Select Category</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={!!errors.subCategory}
                  disabled={!category || subCategories.length === 0}
                >
                  <InputLabel>Transaction Description</InputLabel>
                  <Select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    label="Transaction Description"
                  >
                    <MenuItem value="" disabled>Select Description</MenuItem>
                    {subCategories.map(desc => (
                      <MenuItem key={desc} value={desc}>{desc}</MenuItem>
                    ))}
                  </Select>
                  {errors.subCategory && <FormHelperText>{errors.subCategory}</FormHelperText>}
                  {category && subCategories.length === 0 && (
                    <FormHelperText>
                      No transactions found with this category. Please create a transaction first.
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionOutlined />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="Add details about this tax"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  error={!!errors.percentage}
                  helperText={errors.percentage}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PercentOutlined />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  variant="outlined"
                  margin="normal"
                  type="number"
                  inputProps={{ min: "0", max: "100", step: "0.01" }}
                  placeholder="e.g., 15"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={isEditing ? <Update /> : null}
                  sx={{ 
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    bgcolor: isEditing ? '#2e7d32' : '#1976d2',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
                      bgcolor: isEditing ? '#1b5e20' : '#1565c0',
                    }
                  }}
                >
                  {isEditing ? 'Update Tax' : 'Add Tax'}
                </Button>
                
                {isEditing && (
                  <Button
                    type="button"
                    variant="outlined"
                    size="large"
                    onClick={resetForm}
                    sx={{ 
                      ml: 2,
                      mt: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default AddTax; 