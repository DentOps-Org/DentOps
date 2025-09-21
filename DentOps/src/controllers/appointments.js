const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get appointments with filtering options
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { dentalStaffId, patientId, status, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by dental staff
    if (dentalStaffId) {
      query.dentalStaffId = dentalStaffId;
    }
    
    // Filter by patient
    if (patientId) {
      query.patientId = patientId;
    }
    
    // If user is a patient, only show their appointments
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user.id;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.startTime = {};
      
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }
    
    // Execute query with populated fields
    const appointments = await Appointment.find(query)
      .populate('patientId', 'fullName email phone')
      .populate('dentalStaffId', 'fullName')
      .populate('appointmentTypeId', 'name durationMinutes')
      .sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName email phone')
      .populate('dentalStaffId', 'fullName')
      .populate('appointmentTypeId', 'name durationMinutes');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user has permission to view this appointment
    if (req.user.role === 'PATIENT' && appointment.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { dentalStaffId, startTime, notes, patientId, appointmentTypeId, requestedDate } = req.body;
    
    console.log('Received appointment data:', {
      dentalStaffId,
      startTime,
      notes,
      patientId,
      appointmentTypeId,
      requestedDate,
      user: req.user
    });
    
    // Check if dental staff exists (if provided)
    if (dentalStaffId) {
      const dentalStaff = await User.findById(dentalStaffId);
      if (!dentalStaff || dentalStaff.role !== 'DENTAL_STAFF') {
        return res.status(400).json({
          success: false,
          message: 'Invalid dental staff'
        });
      }
    }
    
    // Determine patient ID based on user role
    let targetPatientId = patientId;
    if (req.user.role === 'PATIENT') {
      // Patients can only create appointments for themselves
      targetPatientId = req.user.id;
    } else if (req.user.role === 'DENTAL_STAFF' && patientId) {
      // Staff can create appointments for any patient
      // patientId might be an email, so we need to look it up
      if (patientId.includes('@')) {
        const patient = await User.findOne({ email: patientId, role: 'PATIENT' });
        if (!patient) {
          return res.status(400).json({
            success: false,
            message: 'Patient not found with this email'
          });
        }
        targetPatientId = patient._id;
      }
    }
    
    // Verify patient exists
    const patient = await User.findById(targetPatientId);
    if (!patient || patient.role !== 'PATIENT') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient'
      });
    }

    // Verify appointment type exists
    const AppointmentType = require('../models/AppointmentType');
    const appointmentType = await AppointmentType.findById(appointmentTypeId);
    if (!appointmentType || !appointmentType.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment type'
      });
    }
    
    console.log('Appointment type found:', appointmentType);

    let appointment;
    
    if (req.user.role === 'PATIENT') {
      // Patients create appointment requests (PENDING status)
      appointment = await Appointment.createRequest(targetPatientId, appointmentTypeId, new Date(requestedDate));
    } else if (req.user.role === 'DENTAL_STAFF') {
      // Dental staff can create confirmed appointments directly
      if (!dentalStaffId || !startTime) {
        return res.status(400).json({
          success: false,
          message: 'Dental staff ID and start time are required for staff-created appointments'
        });
      }
      
      // Convert startTime from IST to UTC and compute endTime
      const startTimeUTC = new Date(startTime);
      // Adjust for IST (UTC+5:30) - subtract 5:30 from the time
      const istOffsetMinutes = 5 * 60 + 30; // 5 hours 30 minutes in minutes
      startTimeUTC.setTime(startTimeUTC.getTime() - (istOffsetMinutes * 60000));
      
      const endTimeUTC = new Date(startTimeUTC.getTime() + (appointmentType.durationMinutes * 60000));
      
      // Check for conflicts
      const conflict = await Appointment.checkConflict(dentalStaffId, startTimeUTC, endTimeUTC);
      
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Dental staff already booked during this time'
        });
      }
      
      // Create confirmed appointment
      appointment = await Appointment.create({
        patientId: targetPatientId,
        dentalStaffId,
        appointmentTypeId,
        requestedDate: new Date(requestedDate),
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        notes,
        status: 'CONFIRMED'
      });
    }
    
    // Populate fields for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'fullName email phone')
      .populate('dentalStaffId', 'fullName')
      .populate('appointmentTypeId', 'name durationMinutes');
    
    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Error in createAppointment:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    if (error.name === 'ConflictError') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user has permission to update this appointment
    const isPatientOwner = req.user.role === 'PATIENT' && appointment.patientId.toString() === req.user.id;
    const isDentalStaff = req.user.role === 'DENTAL_STAFF';
    
    if (!isPatientOwner && !isDentalStaff) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }
    
    // If rescheduling, check for conflicts
    if ((req.body.startTime && req.body.startTime !== appointment.startTime.toISOString()) || 
        (req.body.endTime && req.body.endTime !== appointment.endTime.toISOString()) ||
        (req.body.providerId && req.body.providerId !== appointment.providerId.toString())) {
      
      const providerId = req.body.providerId || appointment.providerId;
      const startTime = req.body.startTime ? new Date(req.body.startTime) : appointment.startTime;
      const endTime = req.body.endTime ? new Date(req.body.endTime) : appointment.endTime;
      
      const conflict = await Appointment.checkConflict(providerId, startTime, endTime, appointment._id);
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Provider already has an appointment during this time'
        });
      }
    }
    
    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'fullName email phone')
      .populate('providerId', 'fullName specialization');
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ConflictError') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Dental Staff only)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Only dental staff can delete appointments
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete appointments'
      });
    }
    
    await appointment.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get available time slots for a provider
// @route   GET /api/appointments/available
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  try {
    const { providerId, date } = req.query;
    
    if (!providerId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID and date are required'
      });
    }
    
    // Check if provider exists and is a dental staff
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'DENTAL_STAFF') {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }
    
    // Set start and end of the requested date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get all appointments for the provider on the requested date
    const appointments = await Appointment.find({
      providerId,
      startTime: { $gte: startDate, $lte: endDate },
      status: { $in: ['PENDING', 'CONFIRMED'] }
    }).sort({ startTime: 1 });
    
    // Define clinic hours (9 AM to 5 PM)
    const clinicOpenTime = 9; // 9 AM
    const clinicCloseTime = 17; // 5 PM
    const appointmentDuration = 30; // 30 minutes per slot
    
    // Generate all possible time slots
    const slots = [];
    for (let hour = clinicOpenTime; hour < clinicCloseTime; hour++) {
      for (let minute = 0; minute < 60; minute += appointmentDuration) {
        const slotStart = new Date(startDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + appointmentDuration);
        
        // Skip if slot is in the past
        if (slotStart < new Date()) {
          continue;
        }
        
        // Check if slot conflicts with any existing appointment
        const isAvailable = !appointments.some(appt => {
          return (
            (slotStart >= new Date(appt.startTime) && slotStart < new Date(appt.endTime)) ||
            (slotEnd > new Date(appt.startTime) && slotEnd <= new Date(appt.endTime)) ||
            (slotStart <= new Date(appt.startTime) && slotEnd >= new Date(appt.endTime))
          );
        });
        
        if (isAvailable) {
          slots.push({
            startTime: slotStart,
            endTime: slotEnd
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get provider's calendar (day/week view)
// @route   GET /api/appointments/provider/:providerId
// @access  Private (Dental Staff only)
exports.getProviderCalendar = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { range } = req.query; // 'day' or 'week'
    
    // Only dental staff can view provider calendars
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view provider calendars'
      });
    }
    
    // Check if provider exists and is a dental staff
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'DENTAL_STAFF') {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }
    
    // Set start and end dates based on range
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    if (range === 'week') {
      endDate.setDate(endDate.getDate() + 6); // End of week (7 days)
    }
    endDate.setHours(23, 59, 59, 999);
    
    // Get all appointments for the provider in the date range
    const appointments = await Appointment.find({
      providerId,
      startTime: { $gte: startDate, $lte: endDate }
    })
      .populate('patientId', 'fullName')
      .sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
      range: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's appointments (User Appointments)
// @route   GET /appointments/me
// @access  Private
exports.getUserAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'PATIENT') {
      // Patients see their own appointments
      query = { patientId: req.user.id };
    } else if (req.user.role === 'DENTAL_STAFF') {
      // Staff see their provider appointments
      query = { providerId: req.user.id };
    } else {
      return res.status(403).json({ success: false, message: 'Invalid user role' });
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'fullName email phone')
      .populate('providerId', 'fullName specialization')
      .populate('appointmentTypeId', 'name durationMinutes')
      .sort({ startTime: 1 });

    // Convert times to IST for response
    const appointmentsWithIST = appointments.map(appt => ({
      ...appt.toObject(),
      startTime: convertUTCToIST(appt.startTime),
      endTime: convertUTCToIST(appt.endTime)
    }));

    res.status(200).json({
      success: true,
      count: appointmentsWithIST.length,
      data: appointmentsWithIST
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Confirm pending appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Dental Staff only)
exports.confirmAppointment = async (req, res) => {
  try {
    const { startTime, endTime, dentalStaffId } = req.body;
    
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Only dental staff can confirm appointments'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (appointment.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending appointments can be confirmed'
      });
    }
    
    // Convert times to UTC
    const startTimeUTC = new Date(startTime);
    const istOffsetMinutes = 5 * 60 + 30;
    startTimeUTC.setTime(startTimeUTC.getTime() - (istOffsetMinutes * 60000));
    
    const endTimeUTC = new Date(endTime);
    endTimeUTC.setTime(endTimeUTC.getTime() - (istOffsetMinutes * 60000));
    
    // Check for conflicts
    const conflict = await Appointment.checkConflict(dentalStaffId, startTimeUTC, endTimeUTC);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Dental staff already booked during this time'
      });
    }
    
    // Confirm appointment
    await appointment.confirm(startTimeUTC, endTimeUTC, dentalStaffId);
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'fullName email phone')
      .populate('dentalStaffId', 'fullName')
      .populate('appointmentTypeId', 'name durationMinutes');
    
    res.status(200).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check permissions
    const isPatientOwner = req.user.role === 'PATIENT' && appointment.patientId.toString() === req.user.id;
    const isDentalStaff = req.user.role === 'DENTAL_STAFF';
    
    if (!isPatientOwner && !isDentalStaff) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }
    
    await appointment.cancel(reason);
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private (Dental Staff only)
exports.completeAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Only dental staff can complete appointments'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    await appointment.complete();
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Mark appointment as no-show
// @route   PUT /api/appointments/:id/no-show
// @access  Private (Dental Staff only)
exports.markNoShow = async (req, res) => {
  try {
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Only dental staff can mark appointments as no-show'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    await appointment.markNoShow();
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Helper function to convert UTC to IST
const convertUTCToIST = (utcDate) => {
  const istDate = new Date(utcDate);
  istDate.setUTCHours(istDate.getUTCHours() + 5, istDate.getUTCMinutes() + 30);
  return istDate.toISOString();
};
