const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

exports.authenticateUser = async (req, res, next) => {
  try {
    // Get token from header - FIX THE TOKEN EXTRACTION LOGIC
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Log the token for debugging
    console.log('Processing token:', token.substring(0, 15) + '...');
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully, user ID:', decoded.id);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found after token verification');
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

exports.authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in admin request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Log the token for debugging
    console.log('Processing admin token:', token.substring(0, 15) + '...');
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Admin token decoded:', decoded);
      
      // Extract admin ID (handle both formats)
      let adminId;
      if (decoded.id) {
        adminId = decoded.id;
      } else if (decoded.user && decoded.user.id) {
        adminId = decoded.user.id;
      } else {
        console.log('Admin ID not found in token');
        return res.status(401).json({ message: 'Invalid token structure' });
      }
      
      // Check if admin exists
      const admin = await Admin.findById(adminId);
      if (!admin) {
        console.log('Admin not found with ID:', adminId);
        return res.status(401).json({ message: 'Admin not found' });
      }
      
      console.log('Admin authenticated:', admin.email);
      
      // Add admin to request
      req.admin = admin;
      next();
    } catch (jwtError) {
      console.error('JWT verification error for admin:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error for admin:', error);
    return res.status(500).json({ message: 'Server error in auth middleware' });
  }
}; 