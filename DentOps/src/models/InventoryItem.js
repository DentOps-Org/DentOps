const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
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
  reorderThreshold: { 
    type: Number, 
    required: true,
    default: 5,
    min: 0
  },
  price: {
    type: Number,
    min: 0
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

// Instance method: adjust quantity and save
InventoryItemSchema.methods.adjustQuantity = async function(delta, dentalStaffId) {
  if (typeof delta !== 'number' || Number.isNaN(delta)) {
    throw new Error('Delta must be a number');
  }

  const newQty = this.quantity + delta;
  if (newQty < 0) {
    throw new Error('Cannot reduce quantity below zero');
  }

  this.quantity = newQty;
  this.lastUpdated = Date.now();
  this.updatedBy = dentalStaffId;

  return this.save();
};

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
