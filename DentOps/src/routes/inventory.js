const express = require('express');
const { check } = require('express-validator');
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryQuantity,
  getLowStockItems
} = require('../controllers/inventory');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and restrict to dental staff
router.use(protect);
router.use(authorize('DENTAL_STAFF'));

// Get low stock items
router.get('/low-stock', getLowStockItems);

// Get all inventory items
router.get('/', getInventoryItems);

// Get, update, delete single inventory item
router
  .route('/:id')
  .get(getInventoryItem)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

// Adjust inventory quantity
router.put(
  '/:id/adjust',
  [
    check('delta', 'Delta value is required').isNumeric()
  ],
  adjustInventoryQuantity
);

// Create new inventory item
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('quantity', 'Quantity must be a number').optional().isNumeric(),
    check('reorderThreshold', 'Reorder threshold must be a number').optional().isNumeric()
  ],
  createInventoryItem
);

module.exports = router;
