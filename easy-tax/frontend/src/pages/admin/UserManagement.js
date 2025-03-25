import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { API_URL } from '../../config';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Phone validation regex
const phoneRegExp = /^\+[1-9]\d{1,14}$/;

// Validation schema for user update
const UserSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  address: Yup.string().required('Address is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Invalid gender').required('Gender is required'),
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Phone number must include country code (e.g., +1234567890)')
    .required('Phone number is required')
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openAlert, setOpenAlert] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle edit user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  // Handle delete user
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Handle user update
  const handleUpdateUser = async (values, { setSubmitting }) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${selectedUser._id}`, values);
      setSuccess('User updated successfully');
      setOpenSnackbar(true);
      setOpenEditDialog(false);
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${selectedUser._id}`);
      setSuccess('User deleted successfully');
      setOpenSnackbar(true);
      setOpenDeleteDialog(false);
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to generate PDF
  const generatePDF = () => {
    try {
      console.log('Starting PDF generation...');
      
      // Create jsPDF instance - use landscape orientation for more space
      const doc = new jsPDF('landscape');
      console.log('jsPDF instance created');
      
      // Add a basic heading
      doc.setFontSize(16);
      doc.text('Easy Tax - User List', 14, 15);
      
      // Create table data
      const tableColumn = ["Name", "Email", "Gender", "Phone"];
      const tableRows = [];
      
      // Add minimal data, avoiding potential problematic fields
      users.forEach(user => {
        const userData = [
          `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user.email || '',
          user.gender || '',
          user.phoneNumber || ''
        ];
        tableRows.push(userData);
      });
      
      console.log('Preparing to generate table with', tableRows.length, 'rows');
      
      // Generate simple table
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
      doc.save('easy-tax-users.pdf');
      console.log('PDF saved');
      
      // Display success message
      setAlertMessage('PDF generated successfully');
      setAlertSeverity('success');
      setOpenAlert(true);
    } catch (error) {
      console.error('ERROR GENERATING PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
      setAlertMessage(`Error generating PDF: ${error.message}`);
      setAlertSeverity('error');
      setOpenAlert(true);
    }
  };

  // Function to generate detailed PDF for a single user
  const generateUserDetailPDF = (user) => {
    if (!user) {
      console.error('No user provided to generateUserDetailPDF');
      return;
    }
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Easy Tax - User Detail Report', 14, 22);
    
    // Add date
    const currentDate = new Date();
    const formattedCurrentDate = format(currentDate, 'PPpp');
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${formattedCurrentDate}`, 14, 30);
    
    // Add user info
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`User Profile: ${user.firstName || ''} ${user.lastName || ''}`.trim(), 14, 45);
    
    // Format dates safely
    let formattedBirthday = 'N/A';
    let formattedCreatedAt = 'N/A';
    let formattedUpdatedAt = 'N/A';
    
    try {
      if (user.birthday) formattedBirthday = format(new Date(user.birthday), 'PP');
      if (user.createdAt) formattedCreatedAt = format(new Date(user.createdAt), 'PP');
      if (user.updatedAt) formattedUpdatedAt = format(new Date(user.updatedAt), 'PP');
    } catch (err) {
      console.error('Error formatting dates:', err);
    }
    
    // Create user info table with safe values
    const userData = [
      ['ID', user._id || 'N/A'],
      ['First Name', user.firstName || 'N/A'],
      ['Last Name', user.lastName || 'N/A'],
      ['Email', user.email || 'N/A'],
      ['Phone', user.phoneNumber || 'N/A'],
      ['Gender', user.gender || 'N/A'],
      ['Address', user.address || 'N/A'],
      ['Birthday', formattedBirthday],
      ['Registered On', formattedCreatedAt],
      ['Last Updated', formattedUpdatedAt]
    ];
    
    doc.autoTable({
      body: userData,
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
    doc.save(`user-${user._id || 'details'}.pdf`);
  };

  // Function to generate simple PDF
  const generateSimplePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Easy Tax - User List', 105, 15, { align: 'center' });
      
      // Add simple text-based list
      doc.setFontSize(12);
      let yPos = 30;
      
      users.forEach((user, index) => {
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        doc.text(`${index + 1}. ${userName} (${user.email})`, 20, yPos);
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
      doc.save('easy-tax-users-simple.pdf');
      
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
    <AdminLayout title="User Management">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            User Management
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
            disabled={loading || users.length === 0}
          >
            Download as PDF
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TextField
            label="Search users"
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
        ) : filteredUsers.length === 0 ? (
          <Alert severity="info">No users found</Alert>
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
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => handleEditClick(user)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteClick(user)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Edit User Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Formik
                initialValues={{
                  firstName: selectedUser.firstName || '',
                  lastName: selectedUser.lastName || '',
                  address: selectedUser.address || '',
                  gender: selectedUser.gender || '',
                  phoneNumber: selectedUser.phoneNumber || ''
                }}
                validationSchema={UserSchema}
                onSubmit={handleUpdateUser}
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
        
        {/* Delete User Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteUser} color="error">Delete</Button>
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

export default UserManagement; 