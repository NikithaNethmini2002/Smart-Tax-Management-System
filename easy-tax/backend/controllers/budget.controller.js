const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Get all budgets for a user
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get budget by ID
exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new budget
exports.createBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      amount,
      period,
      category,
      startDate,
      notificationThreshold
    } = req.body;

    // Check for existing budget with same category and period
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category: category || '',
      period: period || 'monthly',
      active: true
    });

    if (existingBudget) {
      return res.status(400).json({ 
        message: `You already have an active budget for ${category || 'all categories'} in this ${period || 'monthly'} period` 
      });
    }

    const budget = new Budget({
      user: req.user._id,
      name,
      amount,
      period: period || 'monthly',
      category,
      startDate: startDate || Date.now(),
      notificationThreshold: notificationThreshold || 80
    });

    await budget.save();

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already have a budget for this category and period' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      amount,
      period,
      category,
      startDate,
      active,
      notificationThreshold
    } = req.body;

    // Find budget and make sure it belongs to the user
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check for duplicates if changing category or period
    if ((period && period !== budget.period) || 
        (category !== undefined && category !== budget.category)) {
      
      const existingBudget = await Budget.findOne({
        user: req.user._id,
        category: category || '',
        period: period || budget.period,
        active: true,
        _id: { $ne: budget._id } // Exclude current budget
      });

      if (existingBudget) {
        return res.status(400).json({ 
          message: `You already have an active budget for ${category || 'all categories'} in this ${period || 'monthly'} period` 
        });
      }
    }

    // Update budget fields
    if (name) budget.name = name;
    if (amount) budget.amount = amount;
    if (period) budget.period = period;
    if (category !== undefined) budget.category = category;
    if (startDate) budget.startDate = startDate;
    if (active !== undefined) budget.active = active;
    if (notificationThreshold) budget.notificationThreshold = notificationThreshold;

    await budget.save();

    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Budget not found' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already have a budget for this category and period' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Use findByIdAndDelete instead of remove
    await Budget.findByIdAndDelete(req.params.id);

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get budget status
exports.getBudgetStatus = async (req, res) => {
  try {
    const budgetId = req.params.id;
    const userId = req.user._id;
    
    // Find the budget
    const budget = await Budget.findOne({ _id: budgetId, user: userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // Calculate the budget status
    const status = await calculateBudgetStatus(budget);
    
    // Make sure we return a consistent format
    res.json({
      budgetAmount: budget.amount,
      spent: status.spent || 0,
      remaining: status.remaining || 0,
      percentage: status.percentage || 0
    });
  } catch (error) {
    console.error('Error getting budget status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate budget status
async function calculateBudgetStatus(budget) {
  // Get date range for the budget period
  const periodInfo = calculatePeriodDates(budget.period, budget.startDate);
  
  // Query for expenses within the budget period and category
  const expenseQuery = {
    user: budget.user,
    type: 'expense',
    date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate }
  };
  
  // Add category filter if this is a category-specific budget
  if (budget.category) {
    expenseQuery.category = budget.category;
  }
  
  // Calculate total spent
  const expenseResult = await Transaction.aggregate([
    { $match: expenseQuery },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const spent = expenseResult.length > 0 ? expenseResult[0].total : 0;
  const remaining = budget.amount - spent;
  const percentage = (spent / budget.amount) * 100;
  
  return {
    spent,
    remaining,
    percentage
  };
}

// Get all budgets with their status
exports.getAllBudgetsWithStatus = async (req, res) => {
  try {
    console.log('Getting all budgets with status for user:', req.user._id);
    
    // Get all budgets for the user
    const budgets = await Budget.find({ user: req.user._id });
    console.log('Found budgets:', budgets.length);
    
    // Calculate status for each budget
    const budgetsWithStatus = await Promise.all(budgets.map(async (budget) => {
      // Calculate period start and end dates
      const periodInfo = calculatePeriodDates(budget.period, budget.startDate);
      
      // Get expenses for this period and category
      const expenseQuery = {
        user: req.user._id,
        type: 'expense',
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate }
      };
      
      if (budget.category) {
        expenseQuery.category = budget.category;
      }
      
      const expenses = await Transaction.aggregate([
        { $match: expenseQuery },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      
      const spent = expenses.length > 0 ? expenses[0].total : 0;
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;
      
      return {
        _id: budget._id,
        name: budget.name,
        amount: budget.amount,
        period: budget.period,
        category: budget.category,
        startDate: budget.startDate,
        notificationThreshold: budget.notificationThreshold,
        active: budget.active,
        status: {
          spent,
          remaining,
          percentage,
          thresholdReached: percentage >= budget.notificationThreshold
        }
      };
    }));
    
    console.log('Returning budgets with status:', budgetsWithStatus.length);
    res.json({ budgets: budgetsWithStatus });
  } catch (error) {
    console.error('Error getting budgets with status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recommendations for budget adjustments
exports.getBudgetRecommendations = async (req, res) => {
  try {
    // Get user budgets
    const budgets = await Budget.find({
      user: req.user._id,
      active: true
    });
    
    const recommendations = [];
    
    // Calculate three months ago date for historical analysis
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    // Analyze each budget
    for (const budget of budgets) {
      // Get the query to match transactions for this budget
      const query = {
        user: req.user._id,
        type: 'expense',
        date: { $gte: threeMonthsAgo }
      };
      
      // Add category filter if this is a category budget
      if (budget.category) {
        query.category = budget.category;
      }
      
      // Group by month to get monthly totals
      const monthlyExpenses = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: { 
              year: { $year: "$date" },
              month: { $month: "$date" }
            },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
      
      if (monthlyExpenses.length >= 2) {
        // Calculate average spending
        const totalSpent = monthlyExpenses.reduce((sum, month) => sum + month.total, 0);
        const avgSpent = totalSpent / monthlyExpenses.length;
        
        // If average spending is significantly different from budget, create recommendation
        const difference = Math.abs(avgSpent - budget.amount);
        const percentDifference = (difference / budget.amount) * 100;
        
        if (percentDifference >= 20) {
          // More than 20% difference - recommend adjustment
          const recommendedAmount = Math.round(avgSpent * 100) / 100;
          
          recommendations.push({
            budgetId: budget._id,
            budgetName: budget.name,
            category: budget.category || 'All Categories',
            currentAmount: budget.amount,
            recommendedAmount,
            percentDifference: Math.round(percentDifference),
            reason: avgSpent > budget.amount ? 
              'You consistently spend more than budgeted in this category' :
              'You consistently spend less than budgeted in this category',
            months: monthlyExpenses.length,
            action: avgSpent > budget.amount ? 'increase' : 'decrease',
            monthlyData: monthlyExpenses.map(month => ({
              month: `${month._id.year}-${month._id.month}`,
              amount: month.total
            }))
          });
        }
      }
    }
    
    // Also look for categories with significant spending but no budget
    const categoriesWithoutBudget = await Transaction.aggregate([
      { 
        $match: { 
          user: req.user._id,
          type: 'expense',
          date: { $gte: threeMonthsAgo }
        } 
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    // Filter out categories that already have budgets
    const budgetCategories = budgets.map(b => b.category);
    const unbudgetedCategories = categoriesWithoutBudget.filter(
      cat => !budgetCategories.includes(cat._id) && cat.total > 100
    );
    
    // Add recommendations for top unbudgeted categories
    unbudgetedCategories.slice(0, 3).forEach(category => {
      const monthlyAvg = category.total / 3; // Assuming 3 months of data
      
      recommendations.push({
        category: category._id,
        recommendedAmount: Math.round(monthlyAvg * 100) / 100,
        totalSpent: category.total,
        reason: 'You have significant spending in this category without a budget',
        action: 'create',
        recommendation: `Consider creating a budget of $${Math.round(monthlyAvg)} for ${category._id}`
      });
    });
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Error generating budget recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate period start and end dates
function calculatePeriodDates(period, startDate) {
  const now = new Date();
  let periodStartDate, periodEndDate;
  
  // If startDate is provided, use it as a reference point
  const referenceDate = startDate ? new Date(startDate) : now;
  
  if (period === 'weekly') {
    // Get the start of the week (Sunday)
    const dayOfWeek = referenceDate.getDay(); // 0 = Sunday
    periodStartDate = new Date(referenceDate);
    periodStartDate.setDate(referenceDate.getDate() - dayOfWeek);
    periodStartDate.setHours(0, 0, 0, 0);
    
    // Calculate the end of the week (Saturday)
    periodEndDate = new Date(periodStartDate);
    periodEndDate.setDate(periodStartDate.getDate() + 6);
    periodEndDate.setHours(23, 59, 59, 999);
  } else if (period === 'monthly') {
    // Start of the current month
    periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // End of the current month
    periodEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'yearly') {
    // Start of the current year
    periodStartDate = new Date(now.getFullYear(), 0, 1);
    
    // End of the current year
    periodEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
  
  return {
    startDate: periodStartDate,
    endDate: periodEndDate,
    current: now
  };
}

// Helper function to get expense trend data
async function getExpenseTrendData(userId, budget, startDate, endDate) {
  // For monthly budgets, break down by day
  // For yearly budgets, break down by month
  const expenseQuery = {
    user: userId,
    type: 'expense',
    date: { $gte: startDate, $lte: endDate }
  };
  
  if (budget.category) {
    expenseQuery.category = budget.category;
  }
  
  let groupBy = {};
  
  if (budget.period === 'monthly') {
    groupBy = {
      day: { $dayOfMonth: "$date" }
    };
  } else if (budget.period === 'yearly') {
    groupBy = {
      month: { $month: "$date" }
    };
  } else if (budget.period === 'weekly') {
    groupBy = {
      day: { $dayOfWeek: "$date" }
    };
  }
  
  const expenseTrend = await Transaction.aggregate([
    { $match: expenseQuery },
    { 
      $group: { 
        _id: groupBy,
        total: { $sum: "$amount" } 
      } 
    },
    { $sort: { "_id.day": 1, "_id.month": 1 } }
  ]);
  
  return expenseTrend;
} 