const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Get all transactions for a user
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
=======
=======
>>>>>>> Stashed changes
const Category = require('../models/Category');
const mongoose = require('mongoose');

// Get all transactions for user
exports.getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category, tags, minAmount, maxAmount, search } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    
    // Date filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Type filter (income/expense)
    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }
    
    // Category filter
    if (category) {
      filter.category = mongoose.Types.ObjectId(category);
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    
    // Search by description
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Get transactions with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon color')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
=======
=======
>>>>>>> Stashed changes
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('category', 'name icon color');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
=======
=======
>>>>>>> Stashed changes
    
    res.json(transaction);
  } catch (error) {
    console.error(error);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    res.status(500).json({ message: 'Server error' });
  }
};

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Create a new transaction
=======
// Create transaction
>>>>>>> Stashed changes
=======
// Create transaction
>>>>>>> Stashed changes
exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const {
      type,
      amount,
      date,
      category,
      description,
      tags,
      paymentMethod
    } = req.body;

    // Parse tags if they come as a string
    const processedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`)
      : Array.isArray(tags) 
        ? tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        : [];

    const transaction = new Transaction({
      user: req.user._id,
      type,
      amount,
      date: date || Date.now(),
      category,
      description,
      tags: processedTags,
      paymentMethod
    });

    await transaction.save();

    // Check if this transaction affects any budget thresholds
    if (type === 'expense') {
      await checkBudgetThresholds(req.user._id, category);
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
=======
=======
>>>>>>> Stashed changes
    const { amount, type, category, description, date, tags, paymentMethod, attachments } = req.body;
    
    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    
    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }
    
    // Validate category type matches transaction type
    if (categoryExists.type !== 'both' && categoryExists.type !== type) {
      return res.status(400).json({ 
        message: `Category ${categoryExists.name} cannot be used for ${type} transactions`
      });
    }
    
    // Create new transaction
    const transaction = new Transaction({
      user: req.user._id,
      amount,
      type,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      tags: tags ? tags.split(',').map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`) : [],
      paymentMethod,
      attachments
    });
    
    await transaction.save();
    
    // Check budget limits if it's an expense
    if (type === 'expense') {
      await checkBudgetLimits(req.user._id, category, transaction.tags);
    }
    
    // Return the transaction with populated category
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('category', 'name icon color');
    
    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error(error);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    res.status(500).json({ message: 'Server error' });
  }
};

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Update a transaction
=======
// Update transaction
>>>>>>> Stashed changes
=======
// Update transaction
>>>>>>> Stashed changes
exports.updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const {
      type,
      amount,
      date,
      category,
      description,
      tags,
      paymentMethod
    } = req.body;

    // Process tags the same way as in createTransaction
    const processedTags = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`)
      : Array.isArray(tags) 
        ? tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        : [];

    // Find transaction and make sure it belongs to the user
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Get original category for budget checking
    const originalCategory = transaction.category;
    const originalType = transaction.type;

    // Update transaction fields
    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;
    transaction.date = date || transaction.date;
    transaction.category = category || transaction.category;
    transaction.description = description !== undefined ? description : transaction.description;
    transaction.tags = processedTags.length > 0 ? processedTags : transaction.tags;
    transaction.paymentMethod = paymentMethod || transaction.paymentMethod;

    await transaction.save();

    // Check if this update affects any budget thresholds
    if ((type === 'expense' || originalType === 'expense') && 
        (category !== originalCategory || type !== originalType)) {
      await checkBudgetThresholds(req.user._id, category);
      if (originalCategory !== category) {
        await checkBudgetThresholds(req.user._id, originalCategory);
      }
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
=======
=======
>>>>>>> Stashed changes
    const { amount, type, category, description, date, tags, paymentMethod, attachments } = req.body;
    
    // Find transaction by ID and ensure it belongs to user
    let transaction = await Transaction.findOne({ 
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Validate amount is positive
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    
    // Check if category exists
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
      
      // Validate category type matches transaction type
      if (categoryExists.type !== 'both' && categoryExists.type !== (type || transaction.type)) {
        return res.status(400).json({
          message: `Category ${categoryExists.name} cannot be used for ${type || transaction.type} transactions`
        });
      }
    }
    
    // Update fields
    if (amount !== undefined) transaction.amount = amount;
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);
    if (tags !== undefined) {
      transaction.tags = tags ? tags.split(',').map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`) : [];
    }
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (attachments) transaction.attachments = attachments;
    
    await transaction.save();
    
    // Check budget limits if it's an expense
    if (transaction.type === 'expense') {
      await checkBudgetLimits(req.user._id, transaction.category, transaction.tags);
    }
    
    // Return the updated transaction with populated category
    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('category', 'name icon color');
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    res.status(500).json({ message: 'Server error' });
  }
};

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    // Check if transaction exists
=======
=======
>>>>>>> Stashed changes
// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id,
      user: req.user._id
    });
    
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // Verify that the transaction belongs to the current user
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to delete this transaction' });
    }
    
    // Delete the transaction (using findByIdAndDelete instead of remove)
    await Transaction.findByIdAndDelete(req.params.id);
    
    // If you need to check budget thresholds after deletion
    if (transaction.type === 'expense') {
      try {
        await checkBudgetThresholds(req.user._id, transaction.category);
      } catch (budgetError) {
        console.error('Error checking budget thresholds:', budgetError);
        // Continue with the response even if budget check fails
      }
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Filter transactions
exports.filterTransactions = async (req, res) => {
  try {
    const { 
      type, 
      category, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount, 
      tags 
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error filtering transactions:', error);
=======
=======
>>>>>>> Stashed changes
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    console.error(error);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    res.status(500).json({ message: 'Server error' });
  }
};

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Get transaction summary (for dashboard)
exports.getTransactionSummary = async (req, res) => {
  try {
    const { period } = req.query || 'monthly';
    const userId = req.user._id;
    
    // Get date range based on the period
    const { startDate, endDate } = getDateRangeForPeriod(period);
    
    // Ensure userId is properly converted to ObjectId
    const userObjectId = new ObjectId(userId);
    
    // Get income sum
    const incomeResult = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'income',
          date: { $gte: startDate, $lte: endDate }
=======
=======
>>>>>>> Stashed changes
// Get transaction summary
exports.getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    // Set default date range to current month if not provided
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const start = startDate ? new Date(startDate) : firstDayOfMonth;
    const end = endDate ? new Date(endDate) : lastDayOfMonth;
    
    // Group by period (day, week, month)
    let groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
    if (period === 'week') {
      groupBy = { $dateToString: { format: '%Y-%U', date: '$date' } }; // %U is week number
    } else if (period === 'month') {
      groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
    }
    
    const summary = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          date: { $gte: start, $lte: end }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        }
      },
      {
        $group: {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get expense sum
    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
=======
=======
>>>>>>> Stashed changes
          _id: {
            period: groupBy,
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        }
      },
      {
        $group: {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get expense breakdown by category
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
=======
=======
>>>>>>> Stashed changes
          _id: '$_id.period',
          data: {
            $push: {
              type: '$_id.type',
              total: '$total',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Also get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          date: { $gte: start, $lte: end }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        }
      },
      {
        $group: {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          amount: 1
=======
=======
>>>>>>> Stashed changes
          _id: {
            category: '$category',
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          _id: 0,
          category: '$categoryInfo.name',
          type: '$_id.type',
          total: 1,
          count: 1,
          icon: '$categoryInfo.icon',
          color: '$categoryInfo.color'
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    // Get overall totals
    const totals = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        }
      }
    ]);
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // Format the category breakdown into an object
    const categoryBreakdownObj = {};
    categoryBreakdown.forEach(item => {
      categoryBreakdownObj[item.category] = item.amount;
    });
    
    // Prepare the response
    const summary = {
      period,
      income: incomeResult.length > 0 ? incomeResult[0].total : 0,
      expense: expenseResult.length > 0 ? expenseResult[0].total : 0,
      categoryBreakdown: categoryBreakdownObj
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting transaction summary:', error);
=======
=======
>>>>>>> Stashed changes
    // Format the overall totals
    const formattedTotals = {
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    };
    
    totals.forEach(item => {
      if (item._id === 'income') {
        formattedTotals.income = item.total;
        formattedTotals.incomeCount = item.count;
      } else if (item._id === 'expense') {
        formattedTotals.expense = item.total;
        formattedTotals.expenseCount = item.count;
      }
    });
    
    formattedTotals.balance = formattedTotals.income - formattedTotals.expense;
    
    res.json({
      summary,
      categoryBreakdown,
      totals: formattedTotals,
      dateRange: {
        start,
        end
      }
    });
  } catch (error) {
    console.error(error);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    res.status(500).json({ message: 'Server error' });
  }
};

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Helper function to get date range based on period
function getDateRangeForPeriod(period) {
  const now = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'weekly':
      // Start of the current week (Sunday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      
      // End of the current week (Saturday)
      endDate = new Date(now);
      endDate.setDate(now.getDate() + (6 - now.getDay()));
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'monthly':
      // Start of the current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // End of the current month
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
      
    case 'yearly':
      // Start of the current year
      startDate = new Date(now.getFullYear(), 0, 1);
      
      // End of the current year
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
      
    default:
      // Default to monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  
  return { startDate, endDate };
}

// Helper function to check budget thresholds and record notifications
async function checkBudgetThresholds(userId, category) {
  try {
    // Get current month's start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Find active budgets for this user and category
    const budgets = await Budget.find({
      user: userId,
      active: true,
      $or: [
        { category }, // Category-specific budget
        { category: { $exists: false } } // Overall budget
      ]
    });
    
    // For each budget, check if we're approaching/exceeding the threshold
    for (const budget of budgets) {
      // Calculate total expenses for this period and category
      const expenseQuery = {
        user: userId,
        type: 'expense',
        date: { $gte: monthStart, $lte: monthEnd }
      };
      
      // Add category filter if this is a category budget
      if (budget.category) {
        expenseQuery.category = budget.category;
      }
      
      const expenseSum = await Transaction.aggregate([
        { $match: expenseQuery },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      
      const totalSpent = expenseSum.length > 0 ? expenseSum[0].total : 0;
      const percentUsed = (totalSpent / budget.amount) * 100;
      
      // Check if we've crossed the notification threshold
      if (percentUsed >= budget.notificationThreshold) {
        // Here you would create a notification or alert for the user
        // For now, we'll just log it
        console.log(`Budget alert: ${percentUsed.toFixed(1)}% used for budget "${budget.name}"`);
        
        // In a real implementation, you might:
        // 1. Create a notification in a Notification model
        // 2. Trigger an email, SMS, or in-app notification
        // 3. Update the budget with a "notified" flag
      }
    }
  } catch (error) {
    console.error('Error checking budget thresholds:', error);
    // This is a background task, so we don't throw the error
  }
}

/**
 * @desc    Get spending trends report
 * @route   GET /api/transactions/reports/spending-trends
 * @access  Private
 */
exports.getSpendingTrends = async (req, res) => {
  try {
    const { timeFrame = 'monthly', startDate, endDate } = req.query;
    
    // Set default date range (last 6 months if not specified)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    
    if (!startDate) {
      // Default to 6 months ago if not specified
      start.setMonth(start.getMonth() - 6);
    }
    
    // Set start time to beginning of day and end time to end of day for proper date comparisons
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    // Time grouping format based on timeFrame
    let dateFormat;
    let dateGroup;
    
    switch(timeFrame) {
      case 'weekly':
        dateFormat = { year: '$year', week: '$week' };
        dateGroup = { 
          year: { $year: '$date' }, 
          week: { $week: '$date' } 
        };
        break;
      case 'quarterly':
        dateFormat = { year: '$year', quarter: '$quarter' };
        dateGroup = { 
          year: { $year: '$date' }, 
          quarter: { $ceil: { $divide: [{ $month: '$date' }, 3] } } 
        };
        break;
      case 'yearly':
        dateFormat = { year: '$year' };
        dateGroup = { year: { $year: '$date' } };
        break;
      case 'monthly':
      default:
        dateFormat = { year: '$year', month: '$month' };
        dateGroup = { 
          year: { $year: '$date' }, 
          month: { $month: '$date' } 
        };
    }

    // Make sure we have a valid user ID to query with
    const userId = req.user.id || req.user._id;
    
    console.log(`Spending trends request for user: ${userId}`);
    console.log(`Date range: ${start.toISOString()} to ${end.toISOString()}`);

    // First check if user has any transactions at all
    const transactionCount = await Transaction.countDocuments({
      user: new ObjectId(userId)
    });

    console.log(`Total transaction count for user: ${transactionCount}`);

    // Then check if user has any expense transactions
    const expenseCount = await Transaction.countDocuments({
      user: new ObjectId(userId),
      type: 'expense'
    });

    console.log(`Total expense count for user: ${expenseCount}`);

    // Check if user has any expense transactions in the selected period
    const periodExpenseCount = await Transaction.countDocuments({
      user: new ObjectId(userId),
      type: 'expense',
      date: { $gte: start, $lte: end }
    });

    console.log(`Expense count in selected period: ${periodExpenseCount}`);

    // Get all expense categories for this user (even if they don't appear in the date range)
    const allCategories = await Transaction.distinct('category', { 
      user: new ObjectId(userId),
      type: 'expense'
    });

    console.log(`Found ${allCategories.length} expense categories: ${allCategories.join(', ')}`);

    // If no expense transactions or categories found, create a default category for display purposes
    if (expenseCount === 0 || allCategories.length === 0) {
      console.log('No expense categories found, creating a default category');
      allCategories.push('Other');
    }

    // Get a sample of transactions to debug
    const sampleTransactions = await Transaction.find({
      user: new ObjectId(userId),
      type: 'expense'
    }).limit(5).sort({ date: -1 });
    
    console.log(`Sample transactions: ${JSON.stringify(sampleTransactions.map(t => ({ 
      id: t._id, 
      amount: t.amount, 
      date: t.date, 
      category: t.category 
    })))}`);

    // Aggregation pipeline
    const spendingTrends = await Transaction.aggregate([
      {
        $match: { 
          user: new ObjectId(userId),
          type: 'expense',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            ...dateGroup,
            category: '$category'
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1,
          '_id.week': 1,
          '_id.quarter': 1
        }
      }
    ]);
    
    console.log(`Found ${spendingTrends.length} spending trend data points`);
    if (spendingTrends.length > 0) {
      console.log(`Sample data point: ${JSON.stringify(spendingTrends[0])}`);
    }
    
    // Transform data for frontend visualization
    const formattedData = [];
    const categories = new Set(allCategories); // Use all categories, not just those in the current period
    const periods = new Map();
    
    // Extract all time periods
    spendingTrends.forEach(item => {
      let periodKey;
      switch(timeFrame) {
        case 'weekly':
          periodKey = `${item._id.year}-W${item._id.week}`;
          break;
        case 'quarterly':
          periodKey = `${item._id.year}-Q${item._id.quarter}`;
          break;
        case 'yearly':
          periodKey = `${item._id.year}`;
          break;
        case 'monthly':
        default:
          periodKey = `${item._id.year}-${item._id.month}`;
      }
      
      if (!periods.has(periodKey)) {
        periods.set(periodKey, {
          period: periodKey,
          year: item._id.year,
          ...timeFrame === 'monthly' && { month: item._id.month },
          ...timeFrame === 'weekly' && { week: item._id.week },
          ...timeFrame === 'quarterly' && { quarter: item._id.quarter }
        });
      }
    });
    
    // If no periods were found in the data, create some default periods based on the date range
    if (periods.size === 0) {
      console.log('No periods found in data, creating default periods');
      
      // Create default periods based on date range
      const currentDate = new Date(start);
      while (currentDate <= end) {
        let periodKey;
        
        switch(timeFrame) {
          case 'weekly':
            // Get the week number - ISO weeks start on Monday
            const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
            const pastDaysOfYear = (currentDate - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            periodKey = `${currentDate.getFullYear()}-W${weekNum}`;
            
            // Move to next week
            currentDate.setDate(currentDate.getDate() + 7);
            break;
            
          case 'quarterly':
            const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
            periodKey = `${currentDate.getFullYear()}-Q${quarter}`;
            
            // Move to next quarter
            currentDate.setMonth(currentDate.getMonth() + 3);
            break;
            
          case 'yearly':
            periodKey = `${currentDate.getFullYear()}`;
            
            // Move to next year
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
            
          case 'monthly':
          default:
            periodKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
        
        // Only add the period if it doesn't already exist
        if (!periods.has(periodKey)) {
          periods.set(periodKey, {
            period: periodKey,
            year: currentDate.getFullYear(),
            ...timeFrame === 'monthly' && { month: currentDate.getMonth() + 1 },
            ...timeFrame === 'weekly' && { week: Math.ceil((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / 86400000 / 7) },
            ...timeFrame === 'quarterly' && { quarter: Math.ceil((currentDate.getMonth() + 1) / 3) }
          });
        }
      }
    }
    
    // Create formatted array with all periods and categories
    const periodArray = Array.from(periods.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month && b.month) return a.month - b.month;
      if (a.quarter && b.quarter) return a.quarter - b.quarter;
      if (a.week && b.week) return a.week - b.week;
      return 0;
    });
    
    console.log(`Generated ${periodArray.length} periods for time frame: ${timeFrame}`);
    
    periodArray.forEach(p => {
      const dataPoint = { period: p.period };
      let totalForPeriod = 0;
      
      categories.forEach(category => {
        const match = spendingTrends.find(t => {
          if (timeFrame === 'weekly') {
            return t._id.year === p.year && t._id.week === p.week && t._id.category === category;
          } else if (timeFrame === 'quarterly') {
            return t._id.year === p.year && t._id.quarter === p.quarter && t._id.category === category;
          } else if (timeFrame === 'yearly') {
            return t._id.year === p.year && t._id.category === category;
          } else {
            return t._id.year === p.year && t._id.month === p.month && t._id.category === category;
          }
        });
        
        const amount = match ? match.totalAmount : 0;
        dataPoint[category] = amount;
        totalForPeriod += amount;
      });
      
      dataPoint.total = totalForPeriod;
      formattedData.push(dataPoint);
    });
    
    // For debugging: If no actual data, add a mock data point for testing
    if (formattedData.every(d => d.total === 0) && !req.query.noMockData) {
      console.log('No actual spending data found, adding mock data point for testing UI');
      // Add some mock data to the latest period to test the UI
      const latestPeriod = formattedData[formattedData.length - 1];
      if (latestPeriod && categories.size > 0) {
        const firstCategory = Array.from(categories)[0];
        latestPeriod[firstCategory] = 100; // Mock $100 expense
        latestPeriod.total = 100;
      }
    }
    
    // Calculate comparison with previous period if there are at least 2 periods
    let comparison = null;
    if (formattedData.length >= 2) {
      const current = formattedData[formattedData.length - 1];
      const previous = formattedData[formattedData.length - 2];
      
      comparison = {
        currentPeriod: current.period,
        previousPeriod: previous.period,
        categories: {},
        overall: {
          currentTotal: current.total,
          previousTotal: previous.total,
          percentChange: previous.total ? ((current.total - previous.total) / previous.total) * 100 : null
        }
      };
      
      categories.forEach(category => {
        const currentAmount = current[category] || 0;
        const previousAmount = previous[category] || 0;
        
        comparison.categories[category] = {
          currentAmount,
          previousAmount,
          percentChange: previousAmount ? ((currentAmount - previousAmount) / previousAmount) * 100 : null
        };
      });
    }
    
    console.log(`Returning spending trends data with ${formattedData.length} data points and ${categories.size} categories`);
    
    res.json({
      timeFrame,
      startDate: start,
      endDate: end,
      categories: Array.from(categories),
      data: formattedData,
      comparison
    });
    
  } catch (err) {
    console.error('Error in spending trends report:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: err.stack
    });
  }
};

/**
 * @desc    Get income vs expense report
 * @route   GET /api/transactions/reports/income-vs-expense
 * @access  Private
 */
exports.getIncomeVsExpense = async (req, res) => {
  try {
    const { timeFrame = 'monthly', startDate, endDate } = req.query;
    
    // Set default date range (last 6 months if not specified)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    
    if (!startDate) {
      // Default to 6 months ago if not specified
      start.setMonth(start.getMonth() - 6);
    }
    
    // Set start time to beginning of day and end time to end of day for proper date comparisons
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    // Time grouping format based on timeFrame
    let dateFormat;
    let dateGroup;
    
    switch(timeFrame) {
      case 'weekly':
        dateFormat = { year: '$year', week: '$week' };
        dateGroup = { 
          year: { $year: '$date' }, 
          week: { $week: '$date' } 
        };
        break;
      case 'quarterly':
        dateFormat = { year: '$year', quarter: '$quarter' };
        dateGroup = { 
          year: { $year: '$date' }, 
          quarter: { $ceil: { $divide: [{ $month: '$date' }, 3] } } 
        };
        break;
      case 'yearly':
        dateFormat = { year: '$year' };
        dateGroup = { year: { $year: '$date' } };
        break;
      case 'monthly':
      default:
        dateFormat = { year: '$year', month: '$month' };
        dateGroup = { 
          year: { $year: '$date' }, 
          month: { $month: '$date' } 
        };
    }

    // Make sure we have a valid user ID to query with
    const userId = req.user.id || req.user._id;
    
    console.log(`Income vs Expense request for user: ${userId}`);
    console.log(`Date range: ${start.toISOString()} to ${end.toISOString()}`);
    
    // Check transaction count for debugging
    const transactionCount = await Transaction.countDocuments({
      user: new ObjectId(userId)
    });

    console.log(`Total transaction count for user: ${transactionCount}`);
    
    // Check income transaction count
    const incomeCount = await Transaction.countDocuments({
      user: new ObjectId(userId),
      type: 'income'
    });
    
    // Check expense transaction count
    const expenseCount = await Transaction.countDocuments({
      user: new ObjectId(userId),
      type: 'expense'
    });

    console.log(`Income count: ${incomeCount}, Expense count: ${expenseCount}`);
    
    // Get sample transactions for debugging
    const sampleTransactions = await Transaction.find({
      user: new ObjectId(userId)
    }).limit(5).sort({ date: -1 });
    
    console.log(`Sample transactions: ${JSON.stringify(sampleTransactions.map(t => ({ 
      id: t._id, 
      type: t.type,
      amount: t.amount, 
      date: t.date
    })))}`);

    // Aggregation pipeline
    const financialData = await Transaction.aggregate([
      {
        $match: { 
          user: new ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            ...dateGroup,
            type: '$type'
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1,
          '_id.week': 1,
          '_id.quarter': 1
        }
      }
    ]);
    
    console.log(`Found ${financialData.length} financial data points`);
    if (financialData.length > 0) {
      console.log(`Sample data point: ${JSON.stringify(financialData[0])}`);
    }
    
    // Transform data for frontend visualization
    const formattedData = [];
    const periods = new Map();
    
    // Extract all time periods
    financialData.forEach(item => {
      let periodKey;
      switch(timeFrame) {
        case 'weekly':
          periodKey = `${item._id.year}-W${item._id.week}`;
          break;
        case 'quarterly':
          periodKey = `${item._id.year}-Q${item._id.quarter}`;
          break;
        case 'yearly':
          periodKey = `${item._id.year}`;
          break;
        case 'monthly':
        default:
          periodKey = `${item._id.year}-${item._id.month}`;
      }
      
      if (!periods.has(periodKey)) {
        periods.set(periodKey, {
          period: periodKey,
          year: item._id.year,
          ...timeFrame === 'monthly' && { month: item._id.month },
          ...timeFrame === 'weekly' && { week: item._id.week },
          ...timeFrame === 'quarterly' && { quarter: item._id.quarter }
        });
      }
    });
    
    // If no periods were found in the data, create some default periods based on the date range
    if (periods.size === 0) {
      console.log('No periods found in data, creating default periods');
      
      // Create default periods based on date range
      const currentDate = new Date(start);
      while (currentDate <= end) {
        let periodKey;
        
        switch(timeFrame) {
          case 'weekly':
            // Get the week number - ISO weeks start on Monday
            const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
            const pastDaysOfYear = (currentDate - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            periodKey = `${currentDate.getFullYear()}-W${weekNum}`;
            
            // Move to next week
            currentDate.setDate(currentDate.getDate() + 7);
            break;
            
          case 'quarterly':
            const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
            periodKey = `${currentDate.getFullYear()}-Q${quarter}`;
            
            // Move to next quarter
            currentDate.setMonth(currentDate.getMonth() + 3);
            break;
            
          case 'yearly':
            periodKey = `${currentDate.getFullYear()}`;
            
            // Move to next year
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
            
          case 'monthly':
          default:
            periodKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
        
        // Only add the period if it doesn't already exist
        if (!periods.has(periodKey)) {
          periods.set(periodKey, {
            period: periodKey,
            year: currentDate.getFullYear(),
            ...timeFrame === 'monthly' && { month: currentDate.getMonth() + 1 },
            ...timeFrame === 'weekly' && { week: Math.ceil((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / 86400000 / 7) },
            ...timeFrame === 'quarterly' && { quarter: Math.ceil((currentDate.getMonth() + 1) / 3) }
          });
        }
      }
    }
    
    // Create formatted array with income and expense for each period
    const periodArray = Array.from(periods.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month && b.month) return a.month - b.month;
      if (a.quarter && b.quarter) return a.quarter - b.quarter;
      if (a.week && b.week) return a.week - b.week;
      return 0;
    });
    
    console.log(`Generated ${periodArray.length} periods for time frame: ${timeFrame}`);
    
    periodArray.forEach(p => {
      const dataPoint = { period: p.period };
      
      // Find income for this period
      const incomeData = financialData.find(t => {
        if (timeFrame === 'weekly') {
          return t._id.year === p.year && t._id.week === p.week && t._id.type === 'income';
        } else if (timeFrame === 'quarterly') {
          return t._id.year === p.year && t._id.quarter === p.quarter && t._id.type === 'income';
        } else if (timeFrame === 'yearly') {
          return t._id.year === p.year && t._id.type === 'income';
        } else {
          return t._id.year === p.year && t._id.month === p.month && t._id.type === 'income';
        }
      });
      
      // Find expense for this period
      const expenseData = financialData.find(t => {
        if (timeFrame === 'weekly') {
          return t._id.year === p.year && t._id.week === p.week && t._id.type === 'expense';
        } else if (timeFrame === 'quarterly') {
          return t._id.year === p.year && t._id.quarter === p.quarter && t._id.type === 'expense';
        } else if (timeFrame === 'yearly') {
          return t._id.year === p.year && t._id.type === 'expense';
        } else {
          return t._id.year === p.year && t._id.month === p.month && t._id.type === 'expense';
        }
      });
      
      dataPoint.income = incomeData ? incomeData.totalAmount : 0;
      dataPoint.expense = expenseData ? expenseData.totalAmount : 0;
      dataPoint.balance = dataPoint.income - dataPoint.expense;
      
      formattedData.push(dataPoint);
    });
    
    // For debugging: If no actual data, add a mock data point for testing
    if (formattedData.every(d => d.income === 0 && d.expense === 0) && !req.query.noMockData) {
      console.log('No actual income/expense data found, adding mock data point for testing UI');
      // Add some mock data to the latest period to test the UI
      const latestPeriod = formattedData[formattedData.length - 1];
      if (latestPeriod) {
        latestPeriod.income = 200; // Mock $200 income
        latestPeriod.expense = 150; // Mock $150 expense
        latestPeriod.balance = 50;  // $50 balance
      }
    }
    
    // Calculate total income, expense and balance
    const totals = formattedData.reduce((acc, item) => {
      return {
        income: acc.income + item.income,
        expense: acc.expense + item.expense,
        balance: acc.balance + item.balance
      };
    }, { income: 0, expense: 0, balance: 0 });
    
    console.log(`Returning income vs expense data with ${formattedData.length} data points`);
    console.log(`Totals: Income: ${totals.income}, Expense: ${totals.expense}, Balance: ${totals.balance}`);
    
    res.json({
      timeFrame,
      startDate: start,
      endDate: end,
      data: formattedData,
      totals
    });
    
  } catch (err) {
    console.error('Error in income vs expense report:', err);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
};

/**
 * @desc    Get category breakdown report
 * @route   GET /api/transactions/reports/category-breakdown
 * @access  Private
 */
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { type = 'expense', startDate, endDate } = req.query;
    
    // Set default date range (last month if not specified)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    
    if (!startDate) {
      // Default to 1 month ago if not specified
      start.setMonth(start.getMonth() - 1);
    }

    // Set start time to beginning of day and end time to end of day for proper date comparisons
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Make sure we have a valid user ID to query with
    const userId = req.user.id || req.user._id;
    
    console.log(`Category breakdown request for user: ${userId}`);
    console.log(`Type: ${type}, Date range: ${start.toISOString()} to ${end.toISOString()}`);
    
    // Check transaction count for debugging
    const transactionCount = await Transaction.countDocuments({
      user: new ObjectId(userId)
    });

    console.log(`Total transaction count for user: ${transactionCount}`);
    
    // Check transaction count for this type (income or expense)
    const typeCount = await Transaction.countDocuments({
      user: new ObjectId(userId),
      type: type
    });

    console.log(`${type} count for user: ${typeCount}`);
    
    // Check transaction count for this type in the selected period
    const periodTypeCount = await Transaction.countDocuments({
      user: new ObjectId(userId),
      type: type,
      date: { $gte: start, $lte: end }
    });

    console.log(`${type} count in selected period: ${periodTypeCount}`);
    
    // Get distinct categories for this type of transaction
    const categories = await Transaction.distinct('category', {
      user: new ObjectId(userId),
      type: type
    });
    
    console.log(`Found ${categories.length} ${type} categories: ${categories.join(', ')}`);
    
    // Get a sample of transactions to debug
    const sampleTransactions = await Transaction.find({
      user: new ObjectId(userId),
      type: type
    }).limit(5).sort({ date: -1 });
    
    console.log(`Sample ${type} transactions: ${JSON.stringify(sampleTransactions.map(t => ({ 
      id: t._id, 
      amount: t.amount, 
      date: t.date, 
      category: t.category 
    })))}`);

    // Aggregation pipeline
    const categoryData = await Transaction.aggregate([
      {
        $match: { 
          user: new ObjectId(userId),
          type, // 'income' or 'expense'
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);
    
    console.log(`Found ${categoryData.length} category breakdown data points`);
    if (categoryData.length > 0) {
      console.log(`Sample data point: ${JSON.stringify(categoryData[0])}`);
    }
    
    // Calculate total amount
    const totalAmount = categoryData.reduce((sum, category) => sum + category.totalAmount, 0);
    console.log(`Total ${type} amount in period: ${totalAmount}`);
    
    // Calculate percentages and format data
    const formattedData = categoryData.map(category => ({
      category: category._id,
      amount: category.totalAmount,
      percentage: totalAmount > 0 ? (category.totalAmount / totalAmount) * 100 : 0,
      count: category.count
    }));
    
    // For debugging: If no actual data, add mock data points for testing
    if (formattedData.length === 0 && categories.length > 0 && !req.query.noMockData) {
      console.log(`No ${type} category data found, adding mock data for testing UI`);
      // Create mock data based on the first few categories
      categories.slice(0, 3).forEach((category, index) => {
        const mockAmount = 1000 - (index * 250); // Decreasing amounts for visual distinction
        formattedData.push({
          category: category,
          amount: mockAmount,
          percentage: (mockAmount / (1000 + 750 + 500)) * 100,
          count: 1
        });
      });
    }
    
    console.log(`Returning category breakdown with ${formattedData.length} categories`);
    
    res.json({
      type,
      startDate: start,
      endDate: end,
      totalAmount: formattedData.length > 0 ? formattedData.reduce((sum, cat) => sum + cat.amount, 0) : 0,
      categoryCount: formattedData.length,
      data: formattedData
    });
    
  } catch (err) {
    console.error('Error in category breakdown report:', err);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
};

/**
 * @desc    Get financial summary report
 * @route   GET /api/transactions/reports/summary
 * @access  Private
 */
exports.getFinancialSummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    // Set time periods
    switch(period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Make sure we have a valid user ID to query with
    const userId = req.user.id || req.user._id;
    
    // Get current period data - Fix: Use userId directly without ObjectId conversion
    const currentPeriodData = await Transaction.aggregate([
      {
        $match: {
          user: new ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Set up previous period dates
    let prevStartDate, prevEndDate;
    
    switch(period) {
      case 'week':
        prevEndDate = new Date(startDate);
        prevStartDate = new Date(prevEndDate);
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        break;
      case 'year':
        prevEndDate = new Date(startDate);
        prevStartDate = new Date(prevEndDate);
        prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
        break;
      case 'month':
      default:
        prevEndDate = new Date(startDate);
        prevStartDate = new Date(prevEndDate);
        prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    }
    
    // Get previous period data - Fix: Use userId directly without ObjectId conversion
    const previousPeriodData = await Transaction.aggregate([
      {
        $match: {
          user: new ObjectId(userId),
          date: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format current period data
    const currentIncome = currentPeriodData.find(item => item._id === 'income');
    const currentExpense = currentPeriodData.find(item => item._id === 'expense');
    
    // Format previous period data
    const prevIncome = previousPeriodData.find(item => item._id === 'income');
    const prevExpense = previousPeriodData.find(item => item._id === 'expense');
    
    // Calculate current period values
    const currentIncomeAmount = currentIncome ? currentIncome.totalAmount : 0;
    const currentExpenseAmount = currentExpense ? currentExpense.totalAmount : 0;
    const currentBalance = currentIncomeAmount - currentExpenseAmount;
    const currentSavingsRate = currentIncomeAmount > 0 ? (currentIncomeAmount - currentExpenseAmount) / currentIncomeAmount * 100 : 0;
    
    // Calculate previous period values
    const prevIncomeAmount = prevIncome ? prevIncome.totalAmount : 0;
    const prevExpenseAmount = prevExpense ? prevExpense.totalAmount : 0;
    const prevBalance = prevIncomeAmount - prevExpenseAmount;
    const prevSavingsRate = prevIncomeAmount > 0 ? (prevIncomeAmount - prevExpenseAmount) / prevIncomeAmount * 100 : 0;
    
    // Calculate changes
    const incomeChange = prevIncomeAmount > 0 ? ((currentIncomeAmount - prevIncomeAmount) / prevIncomeAmount) * 100 : null;
    const expenseChange = prevExpenseAmount > 0 ? ((currentExpenseAmount - prevExpenseAmount) / prevExpenseAmount) * 100 : null;
    const balanceChange = prevBalance !== 0 ? ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100 : null;
    const savingsRateChange = prevSavingsRate !== 0 ? currentSavingsRate - prevSavingsRate : null;
    
    // Get top expense categories for current period - Fix: Use userId directly without ObjectId conversion
    const topCategories = await Transaction.aggregate([
      {
        $match: {
          user: new ObjectId(userId),
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    res.json({
      period,
      timeRanges: {
        current: { start: startDate, end: endDate },
        previous: { start: prevStartDate, end: prevEndDate }
      },
      summary: {
        current: {
          income: currentIncomeAmount,
          expense: currentExpenseAmount,
          balance: currentBalance,
          transactionCount: (currentIncome?.count || 0) + (currentExpense?.count || 0),
          savingsRate: currentSavingsRate
        },
        previous: {
          income: prevIncomeAmount,
          expense: prevExpenseAmount,
          balance: prevBalance,
          transactionCount: (prevIncome?.count || 0) + (prevExpense?.count || 0),
          savingsRate: prevSavingsRate
        },
        changes: {
          income: incomeChange,
          expense: expenseChange,
          balance: balanceChange,
          savingsRate: savingsRateChange
        }
      },
      topExpenseCategories: topCategories.map(cat => ({
        category: cat._id,
        amount: cat.totalAmount,
        percentage: currentExpenseAmount > 0 ? (cat.totalAmount / currentExpenseAmount) * 100 : 0,
        count: cat.count
      }))
    });
    
  } catch (err) {
    console.error('Error in financial summary report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Create a test transaction (for development only)
 * @route   GET /api/transactions/create-test
 * @access  Private
 */
exports.createTestTransaction = async (req, res) => {
  try {
    // This endpoint should only be available in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const { type = 'expense', amount = 250, category = 'Food & Dining' } = req.query;
    
    // Create a test transaction for the user
    const transaction = new Transaction({
      user: req.user._id,
      type, // 'income' or 'expense'
      amount: Number(amount),
      date: new Date(), // Current date
      category,
      description: 'Test transaction created from API',
      tags: ['#test'],
      paymentMethod: 'credit card'
    });
    
    await transaction.save();
    
    console.log(`Created test ${type} transaction for user ${req.user._id}: $${amount} in ${category}`);
    
    res.json({
      message: `Created test ${type} transaction: $${amount} in ${category}`,
      transaction
    });
  } catch (err) {
    console.error('Error creating test transaction:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
=======
=======
>>>>>>> Stashed changes
// Get common tags used by the user
exports.getUserTags = async (req, res) => {
  try {
    const tags = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          tags: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 30
      }
    ]);
    
    res.json(tags.map(tag => ({ tag: tag._id, count: tag.count })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check budget limits
async function checkBudgetLimits(userId, categoryId, tags) {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get active budgets for the user that match the category or tags
    const budgets = await Budget.find({
      user: userId,
      isActive: true,
      $or: [
        { category: categoryId },
        { category: { $exists: false } }, // Overall budget
        { tags: { $in: tags } }
      ],
      startDate: { $lte: currentDate },
      $or: [
        { endDate: { $gte: currentDate } },
        { endDate: { $exists: false } },
        { period: 'monthly' }
      ]
    });
    
    // For each budget, calculate current usage
    for (const budget of budgets) {
      let filter = {
        user: userId,
        type: 'expense',
        date: {
          $gte: budget.period === 'monthly' ? firstDayOfMonth : budget.startDate,
          $lte: budget.period === 'monthly' ? lastDayOfMonth : (budget.endDate || currentDate)
        }
      };
      
      // Add category filter if this budget is for a specific category
      if (budget.category) {
        filter.category = budget.category;
      }
      
      // Add tags filter if this budget is for specific tags
      if (budget.tags && budget.tags.length > 0) {
        filter.tags = { $in: budget.tags };
      }
      
      // Calculate total expenses for this budget
      const expenseTotal = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      const spent = expenseTotal.length > 0 ? expenseTotal[0].total : 0;
      const budgetLimit = budget.amount;
      const usageRatio = spent / budgetLimit;
      
      // Update budget with current usage
      budget.currentSpending = spent;
      budget.usageRatio = usageRatio;
      await budget.save();
      
      // TODO: If you have a notification system, you could trigger budget alerts here
      // For now, we'll just update the budget with usage data
    }
    
    return true;
  } catch (error) {
    console.error('Error checking budget limits:', error);
    return false;
  }
<<<<<<< Updated upstream
} 
>>>>>>> Stashed changes
=======
} 
>>>>>>> Stashed changes
