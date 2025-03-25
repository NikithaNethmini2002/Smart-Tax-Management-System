const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('address').notEmpty().withMessage('Address is required'),
    body('birthday').custom(value => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }).withMessage('Birthday must be a valid date'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  authController.login
);

// @route   POST api/auth/admin/register
// @desc    Register a new admin
// @access  Public
console.log('Registering route: POST /api/auth/register/admin');
router.post(
  '/register/admin',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('address').notEmpty().withMessage('Address is required'),
    body('birthday').custom(value => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }).withMessage('Birthday must be a valid date'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
  ],
  authController.registerAdmin
);

// @route   POST api/auth/admin/login
// @desc    Login admin
// @access  Public
console.log('Registering route: POST /api/auth/login/admin');
router.post(
  '/login/admin',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  authController.loginAdmin
);

// @route   POST api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', authController.refreshToken);

module.exports = router; 