const express = require('express');
const { check } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Add console.log statements to help debug
console.log('Registering admin routes with auth middleware');

// All routes are protected with authentication middleware
router.use(authenticateAdmin);

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', adminController.getAllUsers);

// @route   GET api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/users/:id', adminController.getUserById);

// @route   PUT api/admin/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put(
  '/users/:id',
  [
    check('firstName', 'First name is required').optional().not().isEmpty(),
    check('lastName', 'Last name is required').optional().not().isEmpty(),
    check('address', 'Address is required').optional().not().isEmpty(),
    check('gender', 'Gender must be Male, Female, or Other').optional().isIn(['Male', 'Female', 'Other']),
    check('phoneNumber', 'Phone number is required with country code').optional().matches(/^\+[1-9]\d{1,14}$/)
  ],
  adminController.updateUser
);

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', adminController.deleteUser);

// @route   GET api/admin/admins
// @desc    Get all admins
// @access  Private (Admin)
router.get('/admins', adminController.getAllAdmins);

// @route   GET api/admin/profile
// @desc    Get admin profile
// @access  Private (Admin)
router.get('/profile', adminController.getAdminProfile);

// @route   PUT api/admin/profile
// @desc    Update admin profile
// @access  Private (Admin)
router.put(
  '/profile',
  [
    check('firstName', 'First name is required').optional().not().isEmpty(),
    check('lastName', 'Last name is required').optional().not().isEmpty(),
    check('address', 'Address is required').optional().not().isEmpty(),
    check('gender', 'Gender must be Male, Female, or Other').optional().isIn(['Male', 'Female', 'Other']),
    check('phoneNumber', 'Phone number is required with country code').optional().matches(/^\+[1-9]\d{1,14}$/)
  ],
  adminController.updateAdminProfile
);

// @route   PUT api/admin/admins/:id
// @desc    Update admin
// @access  Private (Admin)
router.put(
  '/admins/:id',
  [
    check('firstName', 'First name is required').optional().not().isEmpty(),
    check('lastName', 'Last name is required').optional().not().isEmpty(),
    check('address', 'Address is required').optional().not().isEmpty(),
    check('gender', 'Gender must be Male, Female, or Other').optional().isIn(['Male', 'Female', 'Other']),
    check('phoneNumber', 'Phone number is required with country code').optional().matches(/^\+[1-9]\d{1,14}$/)
  ],
  adminController.updateAdmin
);

// @route   DELETE api/admin/admins/:id
// @desc    Delete admin
// @access  Private (Admin)
router.delete('/admins/:id', adminController.deleteAdmin);

// @route   DELETE api/admin/profile
// @desc    Delete admin account (self)
// @access  Private (Admin)
router.delete('/profile', adminController.deleteAdminAccount);

// @route   PUT api/admin/password
// @desc    Update admin password
// @access  Private (Admin)
router.put(
  '/password',
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 8 characters').isLength({ min: 8 }),
  ],
  adminController.updatePassword
);

module.exports = router; 