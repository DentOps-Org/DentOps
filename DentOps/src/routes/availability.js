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

// All routes protected
router.use(protect);

// View availability (any authenticated user) //TODO:add that this can only be accessed by dental_staff,use authorize() here
router.get('/:dentalStaffId', getAvailability);

// Free windows (any authenticated user)
router.get('/:dentalStaffId/free-windows', getFreeWindows);

// Clinic Manager only for mutating operations
router.post(
  '/',
  protect,
  authorize('CLINIC_MANAGER'),
  [
    check('dentalStaffId', 'Dental staff ID is required').notEmpty(),
    check('weekday', 'Weekday is required (0-6)').isInt({ min: 0, max: 6 }),
    check('startTimeOfDay', 'Start time is required (HH:MM)').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    check('endTimeOfDay', 'End time is required (HH:MM)').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  ],
  createAvailability
);

// Full replace update (PUT) and hard delete — Clinic Manager only
router.route('/:id')
  .put(
    protect,
    authorize('CLINIC_MANAGER'),
    [
      check('dentalStaffId', 'Dental staff ID is required').notEmpty(),
      check('weekday', 'Weekday is required (0-6)').isInt({ min: 0, max: 6 }),
      check('startTimeOfDay', 'Start time is required (HH:MM)').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      check('endTimeOfDay', 'End time is required (HH:MM)').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    ],
    updateAvailability
  )
  .delete(protect, authorize('CLINIC_MANAGER'), deleteAvailability);

module.exports = router;