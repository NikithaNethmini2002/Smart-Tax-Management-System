const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
<<<<<<< Updated upstream
<<<<<<< Updated upstream

// Get all budgets for a user
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
=======
=======
>>>>>>> Stashed changes
const Category = require('../models/Category');
const mongoose = require('mongoose');

// Get all budgets
exports.getAllBudgets = async (req, res) => {
  try {
    const { isActive, period } = req.query;
    
    // Build filter
    const filter = { user: req.user._id };
    
    if (isActive === 'true') {
      filter.isActive = true;
    } else if (isActive === 'false') {
      filter.isActive = false;
    }
    
    if (period) {
      filter.period = period;
    }
    
    const budgets = await Budget.find(filter)
      .populate('category', 'name icon color')
      .sort({ createdAt: -1 });
    
    // Calculate current spending for each budget
    const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
      const budgetObj = budget.toObject();
      
      // Determine date range based on budget period
      let startDate, endDate;
      const now = new Date();
      
      if (budget.period === 'monthly') {
        // Current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (budget.period === 'yearly') {
        // Current year
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      } else {
        // Custom period uses the budget's own dates
        startDate = budget.startDate;
        endDate = budget.endDate || now;
      }
      
      // Filter for transactions
      const filter = {
        user: req.user._id,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      };
      
      // Add category filter if this budget is for a specific category
      if (budget.category) {
        filter.category = budget.category._id;
      }
      
      // Add tags filter if this budget is for specific tags
      if (budget.tags && budget.tags.length > 0) {
        filter.tags = { $in: budget.tags };
      }
      
      // Calculate spending
      const spending = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      budgetObj.currentSpending = spending.length > 0 ? spending[0].total : 0;
      budgetObj.remainingAmount = budget.amount - budgetObj.currentSpending;
      budgetObj.usagePercentage = (budgetObj.currentSpending / budget.amount) * 100;
      
      // Check if exceeding threshold
      budgetObj.isExceedingThreshold = 
        (budgetObj.currentSpending / budget.amount) >= budget.notificationThreshold;
      
      // Check if exceeding budget
      budgetObj.isExceeded = budgetObj.currentSpending > budget.amount;
      
      return budgetObj;
    }));
    
    res.json(budgetsWithSpending);
  } catch (error) {
    console.error(error);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    res.status(500).json({ message: 'Server error' });
  }
};

// Get budget by ID
exports.getBudgetById = async (req, res) => {
  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
=======
=======
>>>>>>> Stashed changes
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('category', 'name icon color');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream

    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Budget not found' });
    }
=======
=======
>>>>>>> Stashed changes
    
    // Calculate current spending
    const now = new Date();
    let startDate, endDate;
    
    if (budget.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (budget.period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else {
      startDate = budget.startDate;
      endDate = budget.endDate || now;
    }
    
    // Filter for transactions
    const filter = {
      user: req.user._id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    };
    
    // Add category filter if this budget is for a specific category
    if (budget.category) {
      filter.category = budget.category._id;
    }
    
    // Add tags filter if this budget is for specific tags
    if (budget.tags && budget.tags.length > 0) {
      filter.tags = { $in: budget.tags };
    }
    
    // Calculate spending
    const spending = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const budgetObj = budget.toObject();
    budgetObj.currentSpending = spending.length > 0 ? spending[0].total : 0;
    budgetObj.remainingAmount = budget.amount - budgetObj.currentSpending;
    budgetObj.usagePercentage = (budgetObj.currentSpending / budget.amount) * 100;
    
    res.json(budgetObj);
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
// Create a new budget
=======
// Create budget
>>>>>>> Stashed changes
=======
// Create budget
>>>>>>> Stashed changes
exports.createBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

=======
=======
>>>>>>> Stashed changes
    const { name, amount, period, startDate, endDate, category, tags, notificationThreshold } = req.body;
    
    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ message: 'Budget amount must be positive' });
    }
    
    // Check if category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
      
      // Ensure category is for expenses
      if (categoryExists.type !== 'expense' && categoryExists.type !== 'both') {
        return res.status(400).json({ message: 'Category must be applicable for expenses' });
      }
    }
    
    // Process tags
    let processedTags = [];
    if (tags && tags.length > 0) {
      if (Array.isArray(tags)) {
        processedTags = tags;
      } else {
        processedTags = tags.split(',').map(tag => tag.trim());
      }
      
      // Ensure tags start with # if they don't already
      processedTags = processedTags.map(tag => 
        tag.startsWith('#') ? tag : `#${tag}`
      );
    }
    
    // Create budget
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    const budget = new Budget({
      user: req.user._id,
      name,
      amount,
      period: period || 'monthly',
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
      startDate: new Date(startDate || Date.now()),
      endDate: endDate ? new Date(endDate) : undefined,
      category: category || undefined,
      tags: processedTags,
      notificationThreshold: notificationThreshold || 0.8
    });
    
    await budget.save();
    
    // Return with populated category
    const newBudget = await Budget.findById(budget._id)
      .populate('category', 'name icon color');
    
    res.status(201).json(newBudget);
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
// Update a budget
=======
// Update budget
>>>>>>> Stashed changes
=======
// Update budget
>>>>>>> Stashed changes
exports.updateBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
    const { name, amount, period, startDate, endDate, category, tags, notificationThreshold, isActive } = req.body;
    
    // Find budget
    const budget = await Budget.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // Validate amount is positive if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Budget amount must be positive' });
    }
    
    // Check if category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
      
      // Ensure category is for expenses
      if (categoryExists.type !== 'expense' && categoryExists.type !== 'both') {
        return res.status(400).json({ message: 'Category must be applicable for expenses' });
      }
    }
    
    // Process tags if provided
    if (tags !== undefined) {
      const processedTags = Array.isArray(tags) ? 
        tags : 
        tags.split(',').map(tag => tag.trim());
      
      // Ensure tags start with # if they don't already
      budget.tags = processedTags.map(tag => 
        tag.startsWith('#') ? tag : `#${tag}`
      );
    }
    
    // Update fields if provided
    if (name !== undefined) budget.name = name;
    if (amount !== undefined) budget.amount = amount;
    if (period !== undefined) budget.period = period;
    if (startDate !== undefined) budget.startDate = new Date(startDate);
    
    // Update endDate based on period
    if (period === 'custom' && endDate) {
      budget.endDate = new Date(endDate);
    } else if (period !== 'custom') {
      budget.endDate = undefined; // Remove endDate for non-custom periods
    } else if (endDate !== undefined) {
      budget.endDate = new Date(endDate);
    }
    
    if (category !== undefined) {
      budget.category = category || undefined; // Allow removing category (null/empty becomes undefined)
    }
    
    if (notificationThreshold !== undefined) {
      budget.notificationThreshold = notificationThreshold;
    }
    
    if (isActive !== undefined) {
      budget.isActive = isActive;
    }
    
    await budget.save();
    
    // Return with populated category
    const updatedBudget = await Budget.findById(budget._id)
      .populate('category', 'name icon color');
    
    res.json(updatedBudget);
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
=======
=======
>>>>>>> Stashed changes
// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ 
      _id: req.params.id,
      user: req.user._id
    });
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
    await budget.deleteOne();
    res.json({ message: 'Budget removed' });
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
=======
=======
>>>>>>> Stashed changes
// Get budget recommendations
exports.getBudgetRecommendations = async (req, res) => {
  try {
    // Get the last 3 months of data
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Get spending by category
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          type: 'expense',
          date: { $gte: threeMonthsAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);
    
    // Get existing budgets
    const existingBudgets = await Budget.find({ 
      user: req.user._id,
      isActive: true
    }).populate('category', 'name');
    
    // Calculate average monthly spend per category
    const monthlyAverage = categorySpending.map(cat => ({
      categoryId: cat._id,
      categoryName: cat.categoryInfo.name,
      averageMonthly: +(cat.totalSpent / 3).toFixed(2),
      transactionCount: cat.count
    }));
    
    // Prepare recommendations
    const recommendations = [];
    
    for (const category of monthlyAverage) {
      // Check if there's already a budget for this category
      const existingBudget = existingBudgets.find(b => 
        b.category && b.category._id.toString() === category.categoryId.toString()
      );
      
      if (existingBudget) {
        // If budget exists but spending is consistently higher
        if (category.averageMonthly > existingBudget.amount * 1.2) {
          recommendations.push({
            type: 'increase',
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            currentBudget: existingBudget.amount,
            suggestedBudget: Math.ceil(category.averageMonthly * 1.1), // 10% buffer
            reason: `Your average monthly ${category.categoryName} spending (${category.averageMonthly.toFixed(2)}) exceeds your budget by more than 20%`
          });
        }
        // If budget is much higher than actual spending
        else if (category.averageMonthly < existingBudget.amount * 0.7) {
          recommendations.push({
            type: 'decrease',
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            currentBudget: existingBudget.amount,
            suggestedBudget: Math.ceil(category.averageMonthly * 1.2), // 20% buffer
            reason: `Your budget for ${category.categoryName} may be too high. You typically spend only ${category.averageMonthly.toFixed(2)}`
          });
        }
      } else {
        // Suggest new budget for categories with significant spending
        if (category.averageMonthly > 50) { // Threshold to avoid small amounts
          recommendations.push({
            type: 'new',
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            suggestedBudget: Math.ceil(category.averageMonthly * 1.1), // 10% buffer
            reason: `Based on your spending patterns, we recommend creating a ${category.categoryName} budget of ${Math.ceil(category.averageMonthly * 1.1)}`
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          });
        }
      }
    }
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
    res.json({
      recommendations,
      monthlyAverages: monthlyAverage.slice(0, 10) // Top 10 categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
<<<<<<< Updated upstream
}; 
>>>>>>> Stashed changes
=======
}; 
>>>>>>> Stashed changes
