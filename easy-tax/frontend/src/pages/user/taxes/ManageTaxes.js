import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useTheme
} from '@mui/material';
import UserLayout from '../../../components/UserLayout';
import {
  Add as AddIcon,
  Calculate as CalculateIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import AddTax from './AddTax';
import TaxCalculation from './TaxCalculation';
import TaxCharts from './TaxCharts';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ManageTaxes = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [taxData, setTaxData] = useState([]);
  const [editingTax, setEditingTax] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState(null);

  // Load tax data from localStorage on component mount
  useEffect(() => {
    const savedTaxes = localStorage.getItem('userTaxes');
    if (savedTaxes) {
      setTaxData(JSON.parse(savedTaxes));
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddTax = (newTax) => {
    const updatedTaxes = [...taxData, newTax];
    setTaxData(updatedTaxes);
    
    // Save to localStorage
    localStorage.setItem('userTaxes', JSON.stringify(updatedTaxes));
  };

  const handleDeleteTax = () => {
    if (!taxToDelete) return;
    
    const updatedTaxes = taxData.filter(tax => tax.id !== taxToDelete.id);
    setTaxData(updatedTaxes);
    localStorage.setItem('taxData', JSON.stringify(updatedTaxes));
    setDeleteDialogOpen(false);
    setTaxToDelete(null);
  };

  const handleEditTax = (taxId) => {
    const taxToEdit = taxData.find(tax => tax.id === taxId);
    if (taxToEdit) {
      setEditingTax(taxToEdit);
      setActiveTab(0); // Switch to Add Tax tab
    }
  };

  const handleUpdateTax = (updatedTax) => {
    const updatedTaxes = taxData.map(tax => 
      tax.id === updatedTax.id ? updatedTax : tax
    );
    
    setTaxData(updatedTaxes);
    setEditingTax(null);
    
    // Save to localStorage
    localStorage.setItem('userTaxes', JSON.stringify(updatedTaxes));
  };

  const handleDeleteConfirmation = (tax) => {
    setTaxToDelete(tax);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTaxToDelete(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <AddTax 
            onAddTax={handleAddTax} 
            editingTax={editingTax} 
            onUpdateTax={handleUpdateTax}
          />
        );
      case 1:
        return (
          <TaxCalculation 
            taxData={taxData} 
            onDeleteTax={handleDeleteConfirmation}
            onEditTax={handleEditTax}
          />
        );
      case 2:
        return (
          <TaxCharts 
            taxData={taxData}
          />
        );
      default:
        return <Box>Invalid tab</Box>;
    }
  };

  return (
    <UserLayout>
      <Container maxWidth="xl">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            mb: 3,
            borderLeft: `5px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 1,
              fontWeight: 600,
              color: theme.palette.primary.main
            }}
          >
            Manage Taxes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add, calculate, and visualize your tax information for better financial planning.
          </Typography>

          <Paper elevation={2} sx={{ borderRadius: 2, mt: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="tax management tabs"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  py: 2
                }
              }}
            >
              <Tab 
                icon={<AddIcon />} 
                label="Add Tax" 
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
              <Tab 
                icon={<CalculateIcon />} 
                label="Calculation" 
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
              <Tab 
                icon={<BarChartIcon />} 
                label="Charts" 
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
            </Tabs>
            <Divider />
            <Box sx={{ p: 3 }}>
              {renderTabContent()}
            </Box>
          </Paper>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Delete Tax Entry?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete {taxToDelete?.title}? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteTax} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </UserLayout>
  );
};

export default ManageTaxes; 