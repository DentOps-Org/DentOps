const express = require('express');
const { check } = require('express-validator');
const { 
  getAppointments, 
  getAppointment, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
  getAvailableSlots,
  getProviderCalendar,
  getUserAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  markNoShow
} = require('../controllers/appointments');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all appointments with filtering
router.get('/', getAppointments);

// Get available time slots
router.get('/available', getAvailableSlots);

// Get provider's calendar
router.get('/provider/:dentalStaffId', authorize('DENTAL_STAFF'), getProviderCalendar);

// Get user's appointments
router.get('/me', getUserAppointments);

// Appointment status management routes
router.put('/:id/confirm', authorize('DENTAL_STAFF'), confirmAppointment);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/complete', authorize('DENTAL_STAFF'), completeAppointment);
router.put('/:id/no-show', authorize('DENTAL_STAFF'), markNoShow);

// Get, update, delete single appointment
router
  .route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(authorize('DENTAL_STAFF'), deleteAppointment);

// Create new appointment
router.post(
  '/',
  [
    check('appointmentTypeId', 'Appointment type is required').not().isEmpty(),
    check('requestedDate', 'Requested date is required').not().isEmpty()
  ],
  createAppointment
);

module.exports = router;
