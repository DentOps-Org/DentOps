const express = require('express');
const { check } = require('express-validator');
const { 
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getFreeWindows
} = require('../controllers/availability');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get availability for a dental staff member
router.get('/:dentalStaffId', getAvailability);

// Get free time windows for a dental staff member
router.get('/:dentalStaffId/free-windows', getFreeWindows);

// Create availability block
router.post(
  '/',
  [
    check('dentalStaffId', 'Dental staff ID is required').not().isEmpty(),
    check('weekday', 'Weekday is required').isInt({ min: 0, max: 6 }),
    check('startTimeOfDay', 'Start time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    check('endTimeOfDay', 'End time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  ],
  authorize('DENTAL_STAFF'),
  createAvailability
);

// Update and delete availability blocks
router
  .route('/:id')
  .put(authorize('DENTAL_STAFF'), updateAvailability)
  .delete(authorize('DENTAL_STAFF'), deleteAvailability);

module.exports = router;