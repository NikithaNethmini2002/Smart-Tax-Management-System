const express = require('express');
const { check } = require('express-validator');
const budgetController = require('../controllers/budget.controller');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// All routes are protected with authentication middleware
router.use(authenticateUser);

// @route   GET api/budgets
// @desc    Get all budgets
// @access  Private
router.get('/', budgetController.getAllBudgets);

// @route   GET api/budgets/status
// @desc    Get all budgets status
// @access  Private
router.get('/status', budgetController.getAllBudgetsStatus);

// @route   GET api/budgets/recommendations
// @desc    Get budget adjustment recommendations
// @access  Private
router.get('/recommendations', budgetController.getBudgetRecommendations);

// @route   GET api/budgets/:id
// @desc    Get budget by ID
// @access  Private
router.get('/:id', budgetController.getBudgetById);

// @route   GET api/budgets/:id/status
// @desc    Get budget status
// @access  Private
router.get('/:id/status', budgetController.getBudgetStatus);

// @route   POST api/budgets
// @desc    Create a new budget
// @access  Private
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('amount', 'Amount is required and must be a positive number').isFloat({ min: 1 }),
    check('period', 'Period must be weekly, monthly, or yearly').optional().isIn(['weekly', 'monthly', 'yearly']),
    check('notificationThreshold', 'Notification threshold must be between 1 and 100').optional().isInt({ min: 1, max: 100 })
  ],
  budgetController.createBudget
);

// @route   PUT api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put(
  '/:id',
  [
    check('amount', 'Amount must be a positive number').optional().isFloat({ min: 1 }),
    check('period', 'Period must be weekly, monthly, or yearly').optional().isIn(['weekly', 'monthly', 'yearly']),
    check('notificationThreshold', 'Notification threshold must be between 1 and 100').optional().isInt({ min: 1, max: 100 })
  ],
  budgetController.updateBudget
);

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', budgetController.deleteBudget);

module.exports = router; 