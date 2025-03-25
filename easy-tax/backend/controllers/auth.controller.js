const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id, isAdmin = false) => {
  return jwt.sign(
    { id, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (id, isAdmin = false) => {
  return jwt.sign(
    { id, isAdmin },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register user
exports.register = async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { firstName, lastName, email, password, address, birthday, gender, phoneNumber } = req.body;
  console.log('Register request body:', { firstName, lastName, email, address, birthday, gender, phoneNumber });

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      address,
      birthday,
      gender,
      phoneNumber
    });

    // Save user
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        isAdmin: false
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: false
          }
        });
      }
    );
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Register admin
exports.registerAdmin = async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { firstName, lastName, email, password, address, birthday, gender, phoneNumber } = req.body;
  console.log('Register admin request body:', { firstName, lastName, email, address, birthday, gender, phoneNumber });

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin already exists' 
      });
    }

    // Create new admin
    admin = new Admin({
      firstName,
      lastName,
      email,
      password,  // The model pre-save hook will hash this
      address,
      birthday,
      gender,
      phoneNumber
    });

    // Save admin - the pre-save hook will hash the password
    await admin.save();
    
    console.log('Admin saved successfully with ID:', admin.id);

    // Create JWT payload
    const payload = {
      user: {
        id: admin.id,
        isAdmin: true
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            isAdmin: true
          }
        });
      }
    );
  } catch (err) {
    console.error('Register admin error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Use the model's method instead of direct bcrypt
    const isMatch = await user.comparePassword(password);
    console.log('Password check result:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create JWT payload - make sure this matches what the frontend expects
    const payload = {
      id: user.id,
      isAdmin: false
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: false
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Admin login validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;
  console.log('Admin login attempt for email:', email);

  try {
    // Check if admin exists
    let admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found for email:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('Admin found:', admin.id, admin.email);
    
    // Use the model's method instead of direct bcrypt
    const isMatch = await admin.comparePassword(password);
    console.log('Admin password check result:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create JWT payload - consistent structure with user login
    const payload = {
      id: admin.id,
      isAdmin: true
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          admin: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            isAdmin: true
          }
        });
      }
    );
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Generate new access token
    const newToken = generateToken(decoded.id, decoded.isAdmin);

    res.json({
      token: newToken
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}; 