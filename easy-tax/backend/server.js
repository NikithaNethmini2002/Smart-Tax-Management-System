const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const transactionRoutes = require('./routes/transaction.routes');
const budgetRoutes = require('./routes/budget.routes');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Add this right after other middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body);
  next();
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:');
    console.error(err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);

// Add this temporary route for debugging (REMOVE IN PRODUCTION)
app.get('/api/debug/user/:email', async (req, res) => {
  try {
    const user = await require('./models/User').findOne({ email: req.params.email });
    if (!user) {
      return res.json({ exists: false, message: 'User not found' });
    }
    return res.json({ 
      exists: true, 
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this temporary route for creating a test user (REMOVE IN PRODUCTION)
app.get('/api/debug/create-test-user', async (req, res) => {
  try {
    const testUser = new require('./models/User')({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      address: '123 Test St',
      birthday: new Date('1990-01-01'),
      gender: 'Male',
      phoneNumber: '+12345678901'
    });
    
    await testUser.save();
    
    res.json({ 
      success: true, 
      message: 'Test user created',
      email: 'test@example.com',
      password: 'password123'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this temporary route for creating a test admin (REMOVE IN PRODUCTION)
app.get('/api/debug/create-test-admin', async (req, res) => {
  try {
    const Admin = require('./models/Admin');
    const bcrypt = require('bcryptjs');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      return res.json({ 
        success: true, 
        message: 'Test admin already exists',
        email: 'admin@test.com',
        password: 'password123',
        note: 'This admin already exists, no new account was created'
      });
    }

    // Create test admin with password directly hashed (bypassing potential double-hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const testAdmin = new Admin({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,  // Directly use the hashed password
      address: '123 Admin St',
      birthday: new Date('1990-01-01'),
      gender: 'Male',
      phoneNumber: '+12345678901'
    });
    
    // Save without triggering the pre-save hook
    testAdmin.isNew = true;
    await testAdmin.save({ validateBeforeSave: false });
    
    res.json({ 
      success: true, 
      message: 'Test admin created',
      email: 'admin@test.com',
      password: 'password123',
      note: 'This admin was created with a direct password hash'
    });
  } catch (err) {
    console.error('Error creating test admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add this temporary route to create a simple test admin with correct password hashing
app.get('/api/debug/create-simple-admin', async (req, res) => {
  try {
    const Admin = require('./models/Admin');
    
    // Check if simple admin already exists
    let admin = await Admin.findOne({ email: 'simple@admin.com' });
    
    if (admin) {
      // Delete existing admin to recreate it
      await Admin.deleteOne({ email: 'simple@admin.com' });
      console.log('Deleted existing simple admin');
    }
    
    // Create a new admin the standard way (letting the pre-save hook handle password hashing)
    admin = new Admin({
      firstName: 'Simple',
      lastName: 'Admin',
      email: 'simple@admin.com',
      password: 'admin123', // Will be hashed by pre-save hook
      address: '123 Simple St',
      birthday: new Date('1990-01-01'),
      gender: 'Male',
      phoneNumber: '+12345678901'
    });
    
    // Save normally - this will trigger the pre-save hook to hash the password
    await admin.save();
    
    console.log('Simple admin created with ID:', admin.id);
    console.log('Password hash:', admin.password);
    
    res.json({ 
      success: true, 
      message: 'Simple admin created the standard way',
      email: 'simple@admin.com',
      password: 'admin123',
      note: 'This admin was created using the standard registration flow'
    });
  } catch (err) {
    console.error('Error creating simple admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Easy Tax API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 