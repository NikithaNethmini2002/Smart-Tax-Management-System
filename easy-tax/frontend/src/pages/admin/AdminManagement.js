import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { API_URL } from '../../config';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Phone validation regex
const phoneRegExp = /^\+[1-9]\d{1,14}$/;

// Validation schema for admin update
const AdminSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  address: Yup.string().required('Address is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Invalid gender').required('Gender is required'),
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Phone number must include country code (e.g., +1234567890)')
    .required('Phone number is required')
});

const AdminManagement = () => {
  const { auth } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openAlert, setOpenAlert] = useState(false);

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/admins`);
      setAdmins(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch admins');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle edit admin
  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setOpenEditDialog(true);
  };

  // Handle delete admin
  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setOpenDeleteDialog(true);
  };

  // Handle admin update
  const handleUpdateAdmin = async (values, { setSubmitting }) => {
    try {
      await axios.put(`${API_URL}/api/admin/admins/${selectedAdmin._id}`, values);
      setSuccess('Admin updated successfully');
      setOpenSnackbar(true);
      setOpenEditDialog(false);
      fetchAdmins(); // Refresh admin list
    } catch (err) {
      setError('Failed to update admin');
      console.error('Error updating admin:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle admin deletion
  const handleDeleteAdmin = async () => {
    try {
      await axios.delete(`${API_URL}/api/admin/admins/${selectedAdmin._id}`);
      setSuccess('Admin deleted successfully');
      setOpenSnackbar(true);
      setOpenDeleteDialog(false);
      fetchAdmins(); // Refresh admin list
    } catch (err) {
      setError('Failed to delete admin');
      console.error('Error deleting admin:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => 
    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to generate PDF of all admins
  const generatePDF = () => {
    try {
      console.log('Starting admin PDF generation...');
      
      // Create jsPDF instance in landscape orientation for more space
      const doc = new jsPDF('landscape');
      console.log('jsPDF instance created');
      
      // Add a basic heading
      doc.setFontSize(16);
      doc.text('Easy Tax - Admin List', 14, 15);
      
      // Create table data
      const tableColumn = ["Name", "Email", "Gender", "Phone"];
      const tableRows = [];
      
      // Get displayed admins (filtered or all)
      const displayedAdmins = searchTerm ? filteredAdmins : admins;
      
      // Add data to rows
      displayedAdmins.forEach(admin => {
        const adminData = [
          `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
          admin.email || '',
          admin.gender || '',
          admin.phoneNumber || ''
        ];
        tableRows.push(adminData);
      });
      
      console.log('Preparing to generate table with', tableRows.length, 'rows');
      
      // Generate table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      console.log('Table generated successfully');
      
      // Save the PDF
      console.log('Attempting to save PDF...');
      doc.save('easy-tax-admins.pdf');
      console.log('PDF saved');
      
      // Display success message
      setAlertMessage('PDF generated successfully');
      setAlertSeverity('success');
      setOpenAlert(true);
    } catch (error) {
      console.error('ERROR GENERATING PDF:', error);
      setAlertMessage(`Error generating PDF: ${error.message}`);
      setAlertSeverity('error');
      setOpenAlert(true);
    }
  };

  // Function to generate detailed PDF for a single admin
  const generateAdminDetailPDF = (admin) => {
    if (!admin) {
      console.error('No admin provided to generateAdminDetailPDF');
      return;
    }
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Easy Tax - Admin Detail Report', 14, 22);
      
      // Add date
      const currentDate = new Date();
      let formattedCurrentDate;
      try {
        formattedCurrentDate = format(currentDate, 'PPpp');
      } catch (err) {
        formattedCurrentDate = currentDate.toLocaleString();
      }
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${formattedCurrentDate}`, 14, 30);
      
      // Add admin info
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`Admin Profile: ${admin.firstName || ''} ${admin.lastName || ''}`.trim(), 14, 45);
      
      // Format dates safely
      let formattedBirthday = 'N/A';
      let formattedCreatedAt = 'N/A';
      let formattedUpdatedAt = 'N/A';
      
      try {
        if (admin.birthday) formattedBirthday = format(new Date(admin.birthday), 'PP');
        if (admin.createdAt) formattedCreatedAt = format(new Date(admin.createdAt), 'PP');
        if (admin.updatedAt) formattedUpdatedAt = format(new Date(admin.updatedAt), 'PP');
      } catch (err) {
        console.error('Error formatting dates:', err);
      }
      
      // Create admin info table with safe values
      const adminData = [
        ['ID', admin._id || 'N/A'],
        ['First Name', admin.firstName || 'N/A'],
        ['Last Name', admin.lastName || 'N/A'],
        ['Email', admin.email || 'N/A'],
        ['Phone', admin.phoneNumber || 'N/A'],
        ['Gender', admin.gender || 'N/A'],
        ['Address', admin.address || 'N/A'],
        ['Registration Date', formattedCreatedAt],
        ['Last Updated', formattedUpdatedAt]
      ];
      
      autoTable(doc, {
        body: adminData,
        startY: 50,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 }
        }
      });
      
      // Save the PDF
      doc.save(`admin-${admin._id || 'details'}.pdf`);
      
      // Show success message
      setAlertMessage('Admin details PDF generated successfully');
      setAlertSeverity('success');
      setOpenAlert(true);
    } catch (error) {
      console.error('Error generating admin detail PDF:', error);
      setAlertMessage(`Error generating PDF: ${error.message}`);
      setAlertSeverity('error');
      setOpenAlert(true);
    }
  };

  // Simple fallback PDF generator
  const generateSimplePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Easy Tax - Admin List', 105, 15, { align: 'center' });
      
      // Add simple text-based list
      doc.setFontSize(12);
      let yPos = 30;
      
      admins.forEach((admin, index) => {
        const adminName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
        doc.text(`${index + 1}. ${adminName} (${admin.email})`, 20, yPos);
        yPos += 10;
        
        // Add page if needed
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add timestamp
      const date = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.text(`Generated: ${date}`, 20, 285);
      
      // Save the PDF
      doc.save('easy-tax-admins-simple.pdf');
      
      setAlertMessage('PDF generated successfully!');
      setAlertSeverity('success');
      setOpenAlert(true);
    } catch (error) {
      console.error('Simple PDF generation error:', error);
      setAlertMessage('Error generating PDF: ' + error.message);
      setAlertSeverity('error');
      setOpenAlert(true);
    }
  };

  return (
    <AdminLayout title="Admin Management">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Admin Management
          </Typography>
          
          {/* Add Download as PDF Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => {
              console.log('Download button clicked');
              try {
                generatePDF();
              } catch (error) {
                console.error('Primary PDF generation failed, trying simple version:', error);
                // Fallback to simple PDF if the main one fails
                generateSimplePDF();
              }
            }}
            disabled={loading || admins.length === 0}
          >
            Download as PDF
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TextField
            label="Search admins"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, maxWidth: 500 }}
            InputProps={{
              endAdornment: <SearchIcon color="action" />
            }}
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : filteredAdmins.length === 0 ? (
          <Alert severity="info">No admins found</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.gender}</TableCell>
                    <TableCell>{admin.phoneNumber}</TableCell>
                    <TableCell>{formatDate(admin.createdAt)}</TableCell>
                    <TableCell>
                      {/* Don't allow editing or deleting the current admin */}
                      {auth.user && admin._id !== auth.user.id && (
                        <>
                          <IconButton 
                            color="primary" 
                            size="small" 
                            onClick={() => handleEditClick(admin)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small" 
                            onClick={() => handleDeleteClick(admin)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      {auth.user && admin._id === auth.user.id && (
                        <Typography variant="caption" color="text.secondary">
                          Current User
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Edit Admin Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogContent>
            {selectedAdmin && (
              <Formik
                initialValues={{
                  firstName: selectedAdmin.firstName || '',
                  lastName: selectedAdmin.lastName || '',
                  address: selectedAdmin.address || '',
                  gender: selectedAdmin.gender || '',
                  phoneNumber: selectedAdmin.phoneNumber || ''
                }}
                validationSchema={AdminSchema}
                onSubmit={handleUpdateAdmin}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      name="firstName"
                      label="First Name"
                      error={errors.firstName && touched.firstName}
                      helperText={touched.firstName && errors.firstName}
                    />
                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      name="lastName"
                      label="Last Name"
                      error={errors.lastName && touched.lastName}
                      helperText={touched.lastName && errors.lastName}
                    />
                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      name="address"
                      label="Address"
                      error={errors.address && touched.address}
                      helperText={touched.address && errors.address}
                    />
                    <Field
                      as={TextField}
                      select
                      fullWidth
                      margin="normal"
                      name="gender"
                      label="Gender"
                      error={errors.gender && touched.gender}
                      helperText={touched.gender && errors.gender}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Field>
                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      name="phoneNumber"
                      label="Phone Number (with country code)"
                      error={errors.phoneNumber && touched.phoneNumber}
                      helperText={touched.phoneNumber && errors.phoneNumber}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button onClick={() => setOpenEditDialog(false)} sx={{ mr: 1 }}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={isSubmitting}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Admin Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Delete Admin</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete {selectedAdmin?.firstName} {selectedAdmin?.lastName}? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteAdmin} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
        
        {/* Success Snackbar */}
        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={6000} 
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
        
        {/* Alert Snackbar */}
        <Snackbar
          open={openAlert}
          autoHideDuration={6000}
          onClose={() => setOpenAlert(false)}
        >
          <Alert
            onClose={() => setOpenAlert(false)}
            severity={alertSeverity}
            sx={{ width: '100%' }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default AdminManagement; 