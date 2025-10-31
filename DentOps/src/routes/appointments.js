const express = require('express');
const { check } = require('express-validator');
const {
  createAppointment,
  listRequests,
  confirmAppointment,
  getAvailableSlots,
  cancelAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointments');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// protect all routes
router.use(protect);

// Patient creates request (PENDING)
router.post(
  '/',
  [
    check('appointmentTypeId', 'appointmentTypeId is required').notEmpty(),
    check('requestedDate', 'requestedDate is required (YYYY-MM-DD)').notEmpty()
  ],
  createAppointment
);

// Manager lists requests (PENDING by default)
router.get('/requests', protect, authorize('CLINIC_MANAGER'), listRequests);

// Manager confirms/assigns a pending request
router.post('/:id/confirm', protect, authorize('CLINIC_MANAGER'), confirmAppointment);

// Thin wrapper to get available slots for a dentist
router.get('/available', protect, getAvailableSlots);

// Cancel appointment (patient/dentist/manager rules handled in controller)
router.patch('/:id/cancel', protect, cancelAppointment);

// Read/update/delete endpoints
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, authorize('CLINIC_MANAGER'), updateAppointment);
router.delete('/:id', protect, authorize('CLINIC_MANAGER'), deleteAppointment);

// (Optional) provider calendar / listing route could be added separately

module.exports = router;