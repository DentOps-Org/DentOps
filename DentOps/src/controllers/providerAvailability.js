const ProviderAvailability = require('../models/ProviderAvailability');
const Appointment = require('../models/Appointment');
const AppointmentType = require('../models/AppointmentType');
const { validationResult } = require('express-validator');

// Helper to convert IST time string to UTC Date for a given date
const istToUTC = (date, timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const utcDate = new Date(date);
  // Set time in IST (UTC+5:30) - subtract 5:30 from the time
  const istOffsetMinutes = 5 * 60 + 30; // 5 hours 30 minutes in minutes
  utcDate.setUTCHours(hours, minutes, 0, 0);
  utcDate.setTime(utcDate.getTime() - (istOffsetMinutes * 60000));
  return utcDate;
};

// Helper to convert UTC Date to IST time string
const utcToIST = (utcDate) => {
  const istDate = new Date(utcDate);
  istDate.setUTCHours(istDate.getUTCHours() + 5, istDate.getUTCMinutes() + 30);
  return istDate.toISOString();
};

// @desc    Get availability blocks for a provider
// @route   GET /providers/:id/availability
// @access  Private
exports.getProviderAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the requesting user is authorized
    if (req.user.role === 'PATIENT') {
      return res.status(403).json({ success: false, message: 'Patients cannot view raw availability blocks' });
    }
    if (req.user.role === 'DENTAL_STAFF' && req.user.id !== id && req.user.specialization !== 'CLINIC_MANAGER') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this provider\'s availability' });
    }

    const availability = await ProviderAvailability.find({ providerId: id })
      .sort({ weekday: 1, startTimeOfDay: 1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get available slots for a provider on a specific date
// @route   GET /providers/:id/availability/slots?date=YYYY-MM-DD&typeId=<id>&slotInterval=15
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, typeId, slotInterval = 15 } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    if (!typeId) {
      return res.status(400).json({ success: false, message: 'Appointment type ID is required' });
    }

    // Get appointment type to get duration
    const appointmentType = await AppointmentType.findById(typeId);
    if (!appointmentType || !appointmentType.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid appointment type' });
    }
    
    console.log('Slot generation request:', { id, date, typeId, slotInterval });
    console.log('Appointment type:', appointmentType);

    const targetDate = new Date(date);
    const weekday = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find availability blocks applicable to this date
    const availabilityBlocks = await ProviderAvailability.find({
      providerId: id,
      weekday,
      isRecurring: true
    }).sort({ startTimeOfDay: 1 });

    console.log('Availability blocks found:', availabilityBlocks.length);
    console.log('Weekday:', weekday, 'for date:', date);

    if (availabilityBlocks.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Generate candidate slots
    const candidateSlots = [];
    const slotIntervalMinutes = parseInt(slotInterval);
    const durationMinutes = appointmentType.durationMinutes;

    for (const block of availabilityBlocks) {
      const blockStartUTC = istToUTC(targetDate, block.startTimeOfDay);
      const blockEndUTC = istToUTC(targetDate, block.endTimeOfDay);

      // Slide candidate starts using slotInterval
      let candidateStart = new Date(blockStartUTC);
      while (candidateStart.getTime() + (durationMinutes * 60000) <= blockEndUTC.getTime()) {
        const candidateEnd = new Date(candidateStart.getTime() + (durationMinutes * 60000));
        
        // Only accept candidates where candidateStart + duration <= blockEnd
        if (candidateEnd <= blockEndUTC) {
          candidateSlots.push({
            start: candidateStart,
            end: candidateEnd
          });
        }
        
        // Move to next slot interval
        candidateStart = new Date(candidateStart.getTime() + (slotIntervalMinutes * 60000));
      }
    }

    // Get all provider appointments for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      providerId: id,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['PENDING', 'CONFIRMED'] }
    }).select('startTime endTime');

    // Filter out conflicting slots and past slots
    const now = new Date();
    const availableSlots = candidateSlots.filter(slot => {
      // Filter out past slots
      if (slot.start < now) {
        return false;
      }

      // Check for conflicts with existing appointments using exact overlap rule
      const hasConflict = existingAppointments.some(appt => {
        return slot.start < appt.endTime && slot.end > appt.startTime;
      });

      return !hasConflict;
    });

    // Convert to IST for response
    const responseSlots = availableSlots.map(slot => ({
      start: utcToIST(slot.start),
      end: utcToIST(slot.end)
    }));

    res.status(200).json({ success: true, data: responseSlots });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new availability block
// @route   POST /providers/:id/availability
// @access  Private (Dental Staff or Clinic Manager)
exports.createProviderAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { weekday, startTimeOfDay, endTimeOfDay, isRecurring, startDate, endDate } = req.body;

    // Ensure the requesting user is the provider themselves or a clinic manager
    if (req.user.role === 'PATIENT' || (req.user.id !== id && req.user.specialization !== 'CLINIC_MANAGER')) {
      return res.status(403).json({ success: false, message: 'Not authorized to create availability for this provider' });
    }

    // Basic time validation
    const startMinutes = parseInt(startTimeOfDay.split(':')[0]) * 60 + parseInt(startTimeOfDay.split(':')[1]);
    const endMinutes = parseInt(endTimeOfDay.split(':')[0]) * 60 + parseInt(endTimeOfDay.split(':')[1]);
    
    if (startMinutes >= endMinutes) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const availability = await ProviderAvailability.create({
      providerId: id,
      weekday,
      startTimeOfDay,
      endTimeOfDay,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An availability block already exists for this provider on this day with overlapping times.' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update an availability block
// @route   PUT /providers/availability/:id
// @access  Private (Dental Staff or Clinic Manager)
exports.updateProviderAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let availability = await ProviderAvailability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ success: false, message: 'Availability not found' });
    }

    // Ensure the requesting user is the provider themselves or a clinic manager
    if (req.user.role === 'PATIENT' || (req.user.id !== availability.providerId.toString() && req.user.specialization !== 'CLINIC_MANAGER')) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this availability' });
    }

    const { startTimeOfDay, endTimeOfDay } = req.body;
    if (startTimeOfDay && endTimeOfDay) {
      const startMinutes = parseInt(startTimeOfDay.split(':')[0]) * 60 + parseInt(startTimeOfDay.split(':')[1]);
      const endMinutes = parseInt(endTimeOfDay.split(':')[0]) * 60 + parseInt(endTimeOfDay.split(':')[1]);
      
      if (startMinutes >= endMinutes) {
        return res.status(400).json({ success: false, message: 'End time must be after start time' });
      }
    }

    availability = await ProviderAvailability.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An availability block already exists for this provider on this day with overlapping times.' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete an availability block
// @route   DELETE /providers/availability/:id
// @access  Private (Dental Staff or Clinic Manager)
exports.deleteProviderAvailability = async (req, res) => {
  try {
    const availability = await ProviderAvailability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ success: false, message: 'Availability not found' });
    }

    // Ensure the requesting user is the provider themselves or a clinic manager
    if (req.user.role === 'PATIENT' || (req.user.id !== availability.providerId.toString() && req.user.specialization !== 'CLINIC_MANAGER')) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this availability' });
    }

    await availability.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};