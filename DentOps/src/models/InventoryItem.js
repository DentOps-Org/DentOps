const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allow null/undefined values to not trigger uniqueness constraint
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['CONSUMABLE', 'INSTRUMENT', 'MEDICATION', 'OFFICE', 'OTHER'],
    default: 'CONSUMABLE'
  },
  quantity: { 
    type: Number, 
    default: 0,
    min: 0
  },
  unit: { 
    type: String, 
    default: 'pcs' 
  },
  reorderThreshold: { 
    type: Number, 
    default: 5,
    min: 0
  },
  reorderQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    min: 0
  },
  supplier: {
    name: String,
    contactInfo: String,
    website: String
  },
  location: {
    type: String,
    default: 'Main Storage'
  },
  expiryDate: {
    type: Date
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Update lastUpdated timestamp before save
InventoryItemSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Method to check if item is low in stock
InventoryItemSchema.methods.isLowStock = function() {
  return this.quantity <= this.reorderThreshold;
};

// Method to adjust quantity
InventoryItemSchema.methods.adjustQuantity = async function(delta, dentalStaffId) {
  if (this.quantity + delta < 0) {
    throw new Error('Cannot reduce quantity below zero');
  }
  
  this.quantity += delta;
  this.lastUpdated = Date.now();
  this.updatedBy = dentalStaffId;
  
  return this.save();
};

// Static method to adjust quantity by item ID
InventoryItemSchema.statics.adjustQuantity = async function(itemId, delta, dentalStaffId) {
  const item = await this.findById(itemId);
  if (!item) {
    throw new Error('Inventory item not found');
  }
  
  return await item.adjustQuantity(delta, dentalStaffId);
};

// Static method to get all low stock items
InventoryItemSchema.statics.getLowStockItems = function() {
  return this.find({
    $expr: { $lte: ['$quantity', '$reorderThreshold'] }
  });
};

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
