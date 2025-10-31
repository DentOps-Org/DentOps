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

// Public to any authenticated user
router.get('/', protect, getAppointmentTypes);
router.get('/:id', protect, getAppointmentType);

// Clinic Manager only for mutating operations
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
    check('name').optional().not().isEmpty(),
    check('durationMinutes').optional().isInt({ min: 15, max: 300 }),
    check('description').optional().isString(),
    check('isActive').optional().isBoolean()
  ],
  updateAppointmentType
);

router.delete('/:id', protect, authorize('DENTAL_STAFF'), deleteAppointmentType);

module.exports = router;
