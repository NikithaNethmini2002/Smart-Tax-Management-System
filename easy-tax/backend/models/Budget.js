const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    type: String,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    required: true,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  category: {
    type: String,
    default: '' // Empty string means all categories
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  notificationThreshold: {
    type: Number,
    default: 80, // Alert at 80% by default
    min: 1,
    max: 100
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Ensure a user cannot have multiple active budgets for the same category and period
BudgetSchema.index({ user: 1, category: 1, period: 1, active: 1 }, { unique: true, partialFilterExpression: { active: true } });
=======
=======
>>>>>>> Stashed changes
    enum: ['monthly', 'yearly', 'custom'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: function() {
      return this.period === 'custom';
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
    // Not required as it could be overall budget
  },
  tags: [{
    type: String,
    trim: true
  }],
  notificationThreshold: {
    type: Number,
    default: 0.8,  // 80% of budget by default
    min: 0,
    max: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient budget retrieval
BudgetSchema.index({ user: 1, period: 1, isActive: 1 });
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

module.exports = mongoose.model('Budget', BudgetSchema); 