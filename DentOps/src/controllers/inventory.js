const InventoryItem = require('../models/InventoryItem');
const { validationResult } = require('express-validator');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Dental Staff only)
exports.getInventoryItems = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by low stock status
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$reorderThreshold'] };
    }
    
    // Execute query
    const inventoryItems = await InventoryItem.find(query)
      .populate('updatedBy', 'fullName')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private (Dental Staff only)
exports.getInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id)
      .populate('updatedBy', 'fullName');
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (Dental Staff only)
exports.createInventoryItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    // Add user ID to track who created the item
    req.body.updatedBy = req.user.id;
    
    const inventoryItem = await InventoryItem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Item with this SKU already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Dental Staff only)
exports.updateInventoryItem = async (req, res) => {
  try {
    let inventoryItem = await InventoryItem.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Add user ID to track who updated the item
    req.body.updatedBy = req.user.id;
    req.body.lastUpdated = Date.now();
    
    inventoryItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('updatedBy', 'fullName');
    
    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Item with this SKU already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Dental Staff only)
exports.deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    await inventoryItem.remove();
    
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

// @desc    Adjust inventory item quantity
// @route   PUT /api/inventory/:id/adjust
// @access  Private (Dental Staff only)
exports.adjustInventoryQuantity = async (req, res) => {
  try {
    const { delta } = req.body;
    
    if (delta === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Delta value is required'
      });
    }
    
    const inventoryItem = await InventoryItem.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    try {
      await inventoryItem.adjustQuantity(delta, req.user.id);
      
      const updatedItem = await InventoryItem.findById(req.params.id)
        .populate('updatedBy', 'fullName');
      
      res.status(200).json({
        success: true,
        data: updatedItem
      });
    } catch (adjustError) {
      return res.status(400).json({
        success: false,
        message: adjustError.message
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private (Dental Staff only)
exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.getLowStockItems();
    
    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
