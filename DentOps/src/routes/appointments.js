const express = require('express');
const { check } = require('express-validator');
const {
  createAppointment,
  listRequests, 
  confirmAppointment,
  completeAppointment,
  getAvailableSlots,
  cancelAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointments
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
router.get('/requests', protect, authorize('DENTAL_STAFF'), listRequests);

// Manager confirms/assigns a pending request
router.post('/:id/confirm', protect, authorize('DENTAL_STAFF'), confirmAppointment);

// Thin wrapper to get available slots for a dentist
router.get('/available', protect, getAvailableSlots);

// Cancel appointment (patient/dentist/manager rules handled in controller)
router.patch('/:id/cancel', protect, cancelAppointment);

// Complete appointment (dentist only)
router.post('/:id/complete', protect, authorize('DENTAL_STAFF'), completeAppointment);

// Read/update/delete endpoints
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, authorize('DENTAL_STAFF'), updateAppointment);
router.delete('/:id', protect, authorize('DENTAL_STAFF'), deleteAppointment);

// at top of file (after protect middleware)
router.get('/', protect, getAppointments); // <-- new list endpoint (must appear BEFORE router.get('/:id'))


module.exports = router;