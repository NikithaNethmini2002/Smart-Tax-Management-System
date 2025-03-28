const { validationResult } = require('express-validator');
const Category = require('../models/Category');

// Get default categories
exports.getDefaultCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDefault: true });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user categories
exports.getUserCategories = async (req, res) => {
  try {
    const userCategories = await Category.find({ createdBy: req.user._id });
    const defaultCategories = await Category.find({ isDefault: true });
    
    // Combine both with user categories taking precedence
    const uniqueCategories = [...defaultCategories];
    
    // Add user categories, avoiding duplicates
    userCategories.forEach(userCat => {
      if (!uniqueCategories.find(cat => cat.name === userCat.name && cat.type === userCat.type)) {
        uniqueCategories.push(userCat);
      }
    });
    
    res.json(uniqueCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, type, icon, color } = req.body;
    
    // Check if category already exists for this user
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case insensitive
      type,
      createdBy: req.user._id
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = new Category({
      name,
      type,
      icon: icon || 'default-icon',
      color: color || '#6c757d',
      createdBy: req.user._id
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, type, icon, color } = req.body;
    
    // Find category by ID and ensure it belongs to user
    let category = await Category.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found or not authorized' });
    }
    
    // Update fields
    if (name) category.name = name;
    if (type) category.type = type;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    
    await category.save();
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    // Find category by ID and ensure it belongs to user
    const category = await Category.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found or not authorized' });
    }
    
    // Cannot delete default categories
    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default categories' });
    }
    
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 