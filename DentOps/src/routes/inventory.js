// routes/inventory.js
const express = require('express');
const { check } = require('express-validator');
const {
  getInventoryItems,
  getLowStockItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryQuantity
} = require('../controllers/inventory');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and restrict to dental staff
router.use(protect);
router.use(authorize('DENTAL_STAFF'));

// List all inventory items (each item includes isLowStock boolean)
router.get('/', getInventoryItems);

// Get low-stock items only
router.get('/low-stock', getLowStockItems);

// Get a single inventory item
router.get('/:id', getInventoryItem);

// Create new inventory item
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('reorderThreshold', 'Reorder threshold is required and must be a number').exists().isInt({ min: 0 }),
    check('quantity', 'Quantity must be a number').optional().isInt({ min: 0 }),
    check('price', 'Price must be a number').optional().isFloat({ min: 0 })
  ],
  createInventoryItem
);

// Update inventory item (full/partial)
router.put(
  '/:id',
  [
    check('quantity', 'Quantity must be a number').optional().isInt({ min: 0 }),
    check('reorderThreshold', 'Reorder threshold must be a number').optional().isInt({ min: 0 }),
    check('price', 'Price must be a number').optional().isFloat({ min: 0 })
  ],
  updateInventoryItem
);

// Adjust inventory quantity (delta)
router.put(
  '/:id/adjust',
  [
    check('delta', 'Delta value is required and must be a number').exists().isNumeric()
  ],
  adjustInventoryQuantity
);

// Delete inventory item (hard delete)
router.delete('/:id', deleteInventoryItem);

module.exports = router;
