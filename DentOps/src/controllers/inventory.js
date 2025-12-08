// controllers/inventory.js
const { validationResult } = require('express-validator');
const InventoryItem = require('../models/InventoryItem');

/**
 * Helper: compute isLowStock (rule chosen: low only when quantity < reorderThreshold)
 * Returns boolean.
 */
function computeIsLowStock(item) {
  // item can be mongoose document or plain object
  const qty = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity);
  const thr = typeof item.reorderThreshold === 'number' ? item.reorderThreshold : Number(item.reorderThreshold);
  if (Number.isNaN(qty) || Number.isNaN(thr)) return false;
  return qty < thr;
}

/**
 * GET /inventory
 * Return all inventory items, each with isLowStock flag.
 */
exports.getInventoryItems = async (req, res) => {
  try {
    const items = await InventoryItem.find().populate('updatedBy', 'fullName');

    const shaped = items.map(i => {
      const obj = i.toObject();
      obj.isLowStock = computeIsLowStock(obj);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: shaped.length,
      data: shaped
    });
  } catch (err) {
    console.error('getInventoryItems error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /inventory/low-stock
 * Return items that are currently low stock (quantity < reorderThreshold)
 */
exports.getLowStockItems = async (req, res) => {
  try {
    // simple query: quantity < reorderThreshold using $expr
    const lowItems = await InventoryItem.find({
      $expr: { $lt: ['$quantity', '$reorderThreshold'] }
    }).populate('updatedBy', 'fullName');

    const shaped = lowItems.map(i => {
      const obj = i.toObject();
      obj.isLowStock = true; // obviously true here
      return obj;
    });

    res.status(200).json({
      success: true,
      count: shaped.length,
      data: shaped
    });
  } catch (err) {
    console.error('getLowStockItems error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /inventory/:id
 */
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id).populate('updatedBy', 'fullName');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    const obj = item.toObject();
    obj.isLowStock = computeIsLowStock(obj);
    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    console.error('getInventoryItem error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /inventory
 * Create a new inventory item. reorderThreshold is required.
 */
exports.createInventoryItem = async (req, res) => {
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      category,
      quantity = 0,
      reorderThreshold,
      price,
      expiryDate
    } = req.body;

    // require reorderThreshold explicitly (validator ensured numeric)
    const payload = {
      name,
      description,
      category,
      quantity: Number(quantity),
      reorderThreshold: Number(reorderThreshold),
      price: price !== undefined ? Number(price) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      updatedBy: req.user.id
    };

    const item = await InventoryItem.create(payload);
    const obj = item.toObject();
    obj.isLowStock = computeIsLowStock(obj);

    res.status(201).json({
      success: true,
      message: 'Inventory item created',
      data: obj
    });
  } catch (err) {
    console.error('createInventoryItem error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /inventory/:id
 * Update allowed fields of an inventory item.
 */
exports.updateInventoryItem = async (req, res) => {
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // Only allow specific fields to be updated
    const allowed = ['name', 'description', 'category', 'quantity', 'reorderThreshold', 'price', 'expiryDate'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'quantity' || field === 'reorderThreshold' || field === 'price') {
          item[field] = Number(req.body[field]);
        } else if (field === 'expiryDate') {
          item[field] = req.body.expiryDate ? new Date(req.body.expiryDate) : undefined;
        } else {
          item[field] = req.body[field];
        }
      }
    });

    // track updater
    item.updatedBy = req.user.id;
    item.lastUpdated = Date.now();

    const saved = await item.save();
    const obj = saved.toObject();
    obj.isLowStock = computeIsLowStock(obj);

    res.status(200).json({
      success: true,
      message: 'Inventory item updated',
      data: obj
    });
  } catch (err) {
    console.error('updateInventoryItem error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /inventory/:id/adjust
 * Adjust quantity by delta (positive or negative)
 */
exports.adjustInventoryQuantity = async (req, res) => {
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  // parse delta
  const delta = Number(req.body.delta);
  if (Number.isNaN(delta)) {
    return res.status(400).json({ success: false, message: 'Delta must be a number' });
  }

  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    try {
      const updated = await item.adjustQuantity(delta, req.user.id);
      const obj = updated.toObject();
      obj.isLowStock = computeIsLowStock(obj);

      res.status(200).json({
        success: true,
        message: 'Inventory item quantity adjusted',
        data: obj
      });
    } catch (adjErr) {
      // expected business errors (like reducing below zero)
      return res.status(400).json({ success: false, message: adjErr.message });
    }
  } catch (err) {
    console.error('adjustInventoryQuantity error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * DELETE /inventory/:id
 * Hard delete
 */
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    await item.remove();

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted',
      data: {}
    });
  } catch (err) {
    console.error('deleteInventoryItem error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
