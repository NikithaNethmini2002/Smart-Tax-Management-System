const express = require('express');
const { check } = require('express-validator');
const transactionController = require('../controllers/transaction.controller');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// All routes are protected with authentication middleware
router.use(authenticateUser);

// @route   GET api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', transactionController.getAllTransactions);

// @route   GET api/transactions/filter
// @desc    Filter transactions
// @access  Private
router.get('/filter', transactionController.filterTransactions);

// @route   GET api/transactions/summary
// @desc    Get transaction summary
// @access  Private
router.get('/summary', transactionController.getTransactionSummary);

// @route   GET api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', transactionController.getTransactionById);

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private
router.post(
  '/',
  [
    check('type', 'Type must be either income or expense').isIn(['income', 'expense']),
    check('amount', 'Amount is required and must be a positive number').isFloat({ min: 0.01 }),
    check('category', 'Category is required').not().isEmpty(),
    check('date', 'Invalid date').optional().isISO8601()
  ],
  transactionController.createTransaction
);

// @route   PUT api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put(
  '/:id',
  [
    check('type', 'Type must be either income or expense').optional().isIn(['income', 'expense']),
    check('amount', 'Amount must be a positive number').optional().isFloat({ min: 0.01 }),
    check('date', 'Invalid date').optional().isISO8601()
  ],
  transactionController.updateTransaction
);

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router; 