const express = require('express');
const { check } = require('express-validator');
const {
  getAppointmentTypes,
  getAppointmentType,
  createAppointmentType,
  updateAppointmentType,
  deleteAppointmentType
} = require('../controllers/appointmentType');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get appointment types (accessible by all authenticated users)
router.get('/', protect, getAppointmentTypes);

// Get single appointment type (accessible by all authenticated users)
router.get('/:id', protect, getAppointmentType);

// Create, update, delete appointment types (Dental Staff only)
router.post(
  '/',
  protect,
  authorize('DENTAL_STAFF'),
  [
    check('name', 'Appointment type name is required').not().isEmpty(),
    check('durationMinutes', 'Duration is required and must be between 15 and 300 minutes').isInt({ min: 15, max: 300 }),
    check('description', 'Description must be a string').optional().isString()
  ],
  createAppointmentType
);

router.put(
  '/:id',
  protect,
  authorize('DENTAL_STAFF'),
  [
    check('name', 'Appointment type name is required').optional().not().isEmpty(),
    check('durationMinutes', 'Duration must be between 15 and 300 minutes').optional().isInt({ min: 15, max: 300 }),
    check('description', 'Description must be a string').optional().isString(),
    check('isActive', 'isActive must be a boolean').optional().isBoolean()
  ],
  updateAppointmentType
);

router.delete('/:id', protect, authorize('DENTAL_STAFF'), deleteAppointmentType);

module.exports = router;
