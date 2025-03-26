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

    await budget.remove();

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get budget status (current spending vs. allocated budget)
exports.getBudgetStatus = async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Get spending data
    const { period, category, amount } = budget;
    
    // Calculate period start and end dates
    const periodInfo = calculatePeriodDates(period, budget.startDate);
    
    // Get expenses for this period and category
    const expenseQuery = {
      user: req.user._id,
      type: 'expense',
      date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate }
    };
    
    if (category) {
      expenseQuery.category = category;
    }
    
    const expenses = await Transaction.aggregate([
      { $match: expenseQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const spent = expenses.length > 0 ? expenses[0].total : 0;
    const remaining = amount - spent;
    const percentUsed = (spent / amount) * 100;
    
    // Get spending trend data
    const trendData = await getExpenseTrendData(
      req.user._id,
      budget,
      periodInfo.startDate,
      periodInfo.endDate
    );
    
    res.json({
      budget: {
        id: budget._id,
        name: budget.name,
        amount,
        period,
        category: category || 'Overall'
      },
      status: {
        spent,
        remaining,
        percentUsed,
        thresholdReached: percentUsed >= budget.notificationThreshold
      },
      periodInfo,
      trend: trendData
    });
  } catch (error) {
    console.error('Error getting budget status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get status for all budgets
exports.getAllBudgetsStatus = async (req, res) => {
  try {
    const budgets = await Budget.find({ 
      user: req.user._id,
      active: true
    });
    
    const budgetsStatus = await Promise.all(budgets.map(async (budget) => {
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
      const percentUsed = (spent / budget.amount) * 100;
      
      return {
        budget: {
          id: budget._id,
          name: budget.name,
          amount: budget.amount,
          period: budget.period,
          category: budget.category || 'Overall'
        },
        status: {
          spent,
          remaining,
          percentUsed,
          thresholdReached: percentUsed >= budget.notificationThreshold
        }
      };
    }));
    
    // Sort by percentage used (highest first)
    budgetsStatus.sort((a, b) => b.status.percentUsed - a.status.percentUsed);
    
    res.json(budgetsStatus);
  } catch (error) {
    console.error('Error getting all budgets status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get budget recommendations
exports.getBudgetRecommendations = async (req, res) => {
  try {
    const budgets = await Budget.find({ 
      user: req.user._id,
      active: true
    });
    
    const recommendations = await Promise.all(budgets.map(async (budget) => {
      // Get historical spending data for this category
      const now = new Date();
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      const expenseQuery = {
        user: req.user._id,
        type: 'expense',
        date: { $gte: threeMonthsAgo, $lte: now }
      };
      
      if (budget.category) {
        expenseQuery.category = budget.category;
      }
      
      // Get monthly breakdown
      const monthlyExpenses = await Transaction.aggregate([
        { $match: expenseQuery },
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
      
      // Calculate average monthly expense
      let avgMonthlyExpense = 0;
      if (monthlyExpenses.length > 0) {
        avgMonthlyExpense = monthlyExpenses.reduce((sum, month) => sum + month.total, 0) / monthlyExpenses.length;
      }
      
      // Compare with budget amount and generate recommendation
      let recommendation;
      if (monthlyExpenses.length >= 2) {  // Need at least 2 months of data
        // Calculate the percentage adjustment needed
        const adjustment = ((avgMonthlyExpense - budget.amount) / budget.amount) * 100;
        
        if (adjustment > 10) {  // Consistently spending 10%+ more than budgeted
          recommendation = {
            type: 'increase',
            message: `Consider increasing your ${budget.category || 'overall'} budget by approximately ${Math.ceil(adjustment)}%.`,
            suggestedAmount: Math.ceil(avgMonthlyExpense)
          };
        } else if (adjustment < -10) {  // Consistently spending 10%+ less than budgeted
          recommendation = {
            type: 'decrease',
            message: `You're consistently under budget for ${budget.category || 'overall'} expenses. Consider reducing it by approximately ${Math.ceil(Math.abs(adjustment))}%.`,
            suggestedAmount: Math.ceil(avgMonthlyExpense)
          };
        } else {
          recommendation = {
            type: 'maintain',
            message: `Your ${budget.category || 'overall'} budget appears well-aligned with your spending patterns.`,
            suggestedAmount: budget.amount
          };
        }
      } else if (monthlyExpenses.length > 0) {
        recommendation = {
          type: 'maintain',
          message: `Your ${budget.category || 'overall'} budget appears well-aligned with your spending patterns.`,
          suggestedAmount: budget.amount
        };
      } else {
        recommendation = {
          type: 'insufficient_data',
          message: `Not enough historical data to make a recommendation for your ${budget.category || 'overall'} budget.`,
          suggestedAmount: budget.amount
        };
      }
      
      return {
        budgetId: budget._id,
        budgetName: budget.name,
        category: budget.category,
        currentAmount: budget.amount,
        averageSpending: avgMonthlyExpense,
        monthlyTrend: monthlyExpenses.map(month => ({
          year: month._id.year,
          month: month._id.month,
          amount: month.total
        })),
        recommendation
      };
    }));

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting budget recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate period start and end dates
function calculatePeriodDates(period, startDate) {
  const now = new Date();
  let periodStartDate, periodEndDate;
  
  if (period === 'weekly') {
    // Get the current day of week (0 = Sunday, 1 = Monday, etc.)
    const currentDayOfWeek = now.getDay();
    
    // Calculate the date of the beginning of the week (Sunday)
    periodStartDate = new Date(now);
    periodStartDate.setDate(now.getDate() - currentDayOfWeek);
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