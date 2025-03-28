const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');

// Load env variables
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected for seeding');
    seedCategories();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function seedCategories() {
  try {
    // Check if categories already exist
    const count = await Category.countDocuments({ isDefault: true });
    
    if (count > 0) {
      console.log(`${count} default categories already exist. Skipping seeding.`);
      process.exit(0);
    }
    
    // Define default categories
    const expenseCategories = [
      { name: 'Food & Dining', icon: 'restaurant', color: '#FF5722' },
      { name: 'Groceries', icon: 'shopping_cart', color: '#4CAF50' },
      { name: 'Transportation', icon: 'directions_car', color: '#2196F3' },
      { name: 'Housing & Rent', icon: 'home', color: '#9C27B0' },
      { name: 'Utilities', icon: 'power', color: '#FFC107' },
      { name: 'Entertainment', icon: 'movie', color: '#795548' },
      { name: 'Healthcare', icon: 'local_hospital', color: '#F44336' },
      { name: 'Personal Care', icon: 'spa', color: '#E91E63' },
      { name: 'Education', icon: 'school', color: '#673AB7' },
      { name: 'Clothing', icon: 'checkroom', color: '#3F51B5' },
      { name: 'Travel', icon: 'flight', color: '#00BCD4' },
      { name: 'Subscriptions', icon: 'subscriptions', color: '#009688' },
      { name: 'Gifts & Donations', icon: 'card_giftcard', color: '#CDDC39' },
      { name: 'Insurance', icon: 'security', color: '#607D8B' },
      { name: 'Tax', icon: 'receipt', color: '#9E9E9E' }
    ];
    
    const incomeCategories = [
      { name: 'Salary', icon: 'work', color: '#4CAF50' },
      { name: 'Freelance', icon: 'computer', color: '#2196F3' },
      { name: 'Business', icon: 'business', color: '#FF5722' },
      { name: 'Investments', icon: 'trending_up', color: '#9C27B0' },
      { name: 'Rental Income', icon: 'apartment', color: '#00BCD4' },
      { name: 'Gifts', icon: 'redeem', color: '#E91E63' },
      { name: 'Refunds', icon: 'undo', color: '#795548' }
    ];
    
    // Create expense categories
    const expenseCategoryDocs = expenseCategories.map(cat => ({
      name: cat.name,
      type: 'expense',
      icon: cat.icon,
      color: cat.color,
      isDefault: true
    }));
    
    // Create income categories
    const incomeCategoryDocs = incomeCategories.map(cat => ({
      name: cat.name,
      type: 'income',
      icon: cat.icon,
      color: cat.color,
      isDefault: true
    }));
    
    // Insert all categories
    await Category.insertMany([...expenseCategoryDocs, ...incomeCategoryDocs]);
    
    console.log(`Successfully seeded ${expenseCategoryDocs.length + incomeCategoryDocs.length} default categories`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
} 