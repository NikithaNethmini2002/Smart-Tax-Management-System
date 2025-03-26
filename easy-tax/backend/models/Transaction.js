const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit card', 'debit card', 'bank transfer', 'other'],
    default: 'cash'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema); 