const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
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
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
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
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
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
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
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
    res.status(500).json({ message: 'Server error' });
  }
};

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
        }
      },
      {
        $group: {
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
        }
      },
      {
        $group: {
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
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          amount: 1
        }
      }
    ]);
    
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
    res.status(500).json({ message: 'Server error' });
  }
};

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