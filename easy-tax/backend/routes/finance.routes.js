const express = require('express');
const { check } = require('express-validator');
const { authenticateUser } = require('../middleware/auth');
const categoryController = require('../controllers/category.controller');
const transactionController = require('../controllers/transaction.controller');
const budgetController = require('../controllers/budget.controller');

const router = express.Router();

// All routes are protected with authentication middleware
router.use(authenticateUser);

// Category routes
router.get('/categories/default', categoryController.getDefaultCategories);
router.get('/categories', categoryController.getUserCategories);
router.post('/categories', [
  check('name', 'Name is required').not().isEmpty(),
  check('type', 'Type must be expense, income, or both').isIn(['expense', 'income', 'both'])
], categoryController.createCategory);
router.put('/categories/:id', [
  check('name', 'Name is required').optional().not().isEmpty(),
  check('type', 'Type must be expense, income, or both').optional().isIn(['expense', 'income', 'both'])
], categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Transaction routes
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/:id', transactionController.getTransactionById);
router.post('/transactions', [
  check('amount', 'Amount is required and must be positive').isFloat({ gt: 0 }),
  check('type', 'Type must be income or expense').isIn(['income', 'expense']),
  check('category', 'Category is required').not().isEmpty(),
  check('date', 'Date is required').optional().isISO8601()
], transactionController.createTransaction);
router.put('/transactions/:id', [
  check('amount', 'Amount must be positive').optional().isFloat({ gt: 0 }),
  check('type', 'Type must be income or expense').optional().isIn(['income', 'expense']),
  check('date', 'Date must be valid').optional().isISO8601()
], transactionController.updateTransaction);
router.delete('/transactions/:id', transactionController.deleteTransaction);

// Transaction analytics
router.get('/transactions/analytics/summary', transactionController.getTransactionSummary);
router.get('/transactions/analytics/tags', transactionController.getPopularTags);

// Budget routes
router.get('/budgets', budgetController.getAllBudgets);
router.get('/budgets/:id', budgetController.getBudgetById);
router.post('/budgets', [
  check('name', 'Budget name is required').not().isEmpty(),
  check('amount', 'Amount is required and must be positive').isFloat({ gt: 0 }),
  check('period', 'Period must be monthly, yearly, or custom').optional().isIn(['monthly', 'yearly', 'custom']),
  check('startDate', 'Start date is required').isISO8601()
], budgetController.createBudget);
router.put('/budgets/:id', [
  check('amount', 'Amount must be positive').optional().isFloat({ gt: 0 }),
  check('period', 'Period must be monthly, yearly, or custom').optional().isIn(['monthly', 'yearly', 'custom'])
], budgetController.updateBudget);
router.delete('/budgets/:id', budgetController.deleteBudget);
router.get('/budgets/recommendations/analysis', budgetController.getBudgetRecommendations);

module.exports = router; 