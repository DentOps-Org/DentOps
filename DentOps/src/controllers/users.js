const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /users
// @access  Private (Dental Staff only)
exports.getUsers = async (req, res) => {
  try {
    const { role, isVerified, email } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by verification status
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }
    
    // Filter by email (for patient search)
    if (email) {
      query.email = { $regex: email, $options: 'i' }; // Case-insensitive partial match
    }
    
    // Execute query
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all providers (accessible by all authenticated users)
// @route   GET /users/providers
// @access  Private
exports.getProviders = async (req, res) => {
  try {
    //TODO:only the dentist should be here
    const providers = await User.find({ specialization: 'DENTIST' })
      .select('-password')
      .sort({ fullName: 1 });
    
    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has permission to view this user
    if (req.user.role === 'PATIENT' && user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Clinic Manager only)
//TODO: when would this happen??i think its redundant 
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { fullName, email, password, role, phone, specialization, isVerified } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'PATIENT',
      phone,
      specialization: role === 'DENTAL_STAFF' ? (specialization || 'DENTIST') : undefined,
      isVerified: isVerified !== undefined ? isVerified : true
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has permission to update this user
    const isOwner = user._id.toString() === req.user.id;
    const isClinicManager = req.user.role === 'DENTAL_STAFF' && req.user.specialization === 'CLINIC_MANAGER';
    
    if (!isOwner && !isClinicManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Clinic Manager only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    await user.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
