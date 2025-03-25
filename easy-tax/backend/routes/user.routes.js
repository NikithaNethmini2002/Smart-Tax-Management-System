const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// All routes are protected with authentication middleware
router.use(authenticateUser);

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', userController.getUserProfile);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    check('firstName', 'First name is required').optional().not().isEmpty(),
    check('lastName', 'Last name is required').optional().not().isEmpty(),
    check('address', 'Address is required').optional().not().isEmpty(),
    check('gender', 'Gender must be Male, Female, or Other').optional().isIn(['Male', 'Female', 'Other']),
    check('phoneNumber', 'Phone number is required with country code').optional().matches(/^\+[1-9]\d{1,14}$/)
  ],
  userController.updateUserProfile
);

// @route   DELETE api/users
// @desc    Delete user account
// @access  Private
router.delete('/', userController.deleteUserAccount);

// @route   PUT api/users/password
// @desc    Change user password
// @access  Private
router.put(
  '/password',
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 8 characters').isLength({ min: 8 })
  ],
  userController.changePassword
);

module.exports = router; 