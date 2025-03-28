const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
  amount: {
    type: Number,
    required: true
  },
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  amount: {
    type: Number,
    required: true
  },
=======
=======
>>>>>>> Stashed changes
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  tags: [{
    type: String,
    trim: true
  }],
  paymentMethod: {
    type: String,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    enum: ['cash', 'credit card', 'debit card', 'bank transfer', 'other'],
    default: 'cash'
  }
=======
=======
>>>>>>> Stashed changes
    trim: true
  },
  attachments: [{
    url: String,
    name: String
  }]
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}, {
  timestamps: true
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Index to improve query performance for reports
TransactionSchema.index({ user: 1, date: -1, type: 1, category: 1 });
=======
=======
>>>>>>> Stashed changes
// Index for efficient querying by user and date
TransactionSchema.index({ user: 1, date: -1 });
// Index for efficient tag querying
TransactionSchema.index({ user: 1, tags: 1 });
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

module.exports = mongoose.model('Transaction', TransactionSchema); 