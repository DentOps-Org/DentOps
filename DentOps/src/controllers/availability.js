const Availability = require('../models/Availability');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get availability for a dental staff member
// @route   GET /api/availability/:dentalStaffId
// @access  Private
exports.getAvailability = async (req, res) => {
  try {
    const { dentalStaffId } = req.params;
    const { date } = req.query;
    
    // Check if dental staff exists
    const dentalStaff = await User.findById(dentalStaffId);
    if (!dentalStaff || dentalStaff.role !== 'DENTAL_STAFF') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dental staff member'
      });
    }
    
    let availability;
    if (date) {
      // Get availability for specific date
      availability = await Availability.listForDate(dentalStaffId, date);
    } else {
      // Get all availability blocks
      availability = await Availability.find({ dentalStaffId }).sort({ weekday: 1, startTimeOfDay: 1 });
    }
    
    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create availability block
// @route   POST /api/availability
// @access  Private (Dental Staff only)
exports.createAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { dentalStaffId, weekday, startTimeOfDay, endTimeOfDay, isRecurring, startDate, endDate } = req.body;
    
    // Check if user is dental staff
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Only dental staff can create availability blocks'
      });
    }
    
    // Check if dental staff exists
    const dentalStaff = await User.findById(dentalStaffId);
    if (!dentalStaff || dentalStaff.role !== 'DENTAL_STAFF') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dental staff member'
      });
    }
    
    // Create availability block
    const availability = await Availability.createBlock(
      dentalStaffId,
      weekday,
      startTimeOfDay,
      endTimeOfDay,
      isRecurring,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    
    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update availability block
// @route   PUT /api/availability/:id
// @access  Private (Dental Staff only)
exports.updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Only dental staff can update availability blocks'
      });
    }
    
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability block not found'
      });
    }
    
    // Update availability
    const updatedAvailability = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedAvailability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete availability block
// @route   DELETE /api/availability/:id
// @access  Private (Dental Staff only)
exports.deleteAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Only dental staff can delete availability blocks'
      });
    }
    
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability block not found'
      });
    }
    
    await availability.remove();
    
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

// @desc    Get free time windows for a dental staff member
// @route   GET /api/availability/:dentalStaffId/free-windows
// @access  Private
exports.getFreeWindows = async (req, res) => {
  try {
    const { dentalStaffId } = req.params;
    const { date, appointmentTypeId, durationMinutes, slotIntervalMinutes, bufferAfter } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Check if dental staff exists
    const dentalStaff = await User.findById(dentalStaffId);
    if (!dentalStaff || dentalStaff.role !== 'DENTAL_STAFF') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dental staff member'
      });
    }
    
    // Get appointment type duration if provided
    let duration = durationMinutes ? parseInt(durationMinutes) : 30;
    if (appointmentTypeId) {
      const AppointmentType = require('../models/AppointmentType');
      const appointmentType = await AppointmentType.findById(appointmentTypeId);
      if (appointmentType) {
        duration = appointmentType.durationMinutes;
      }
    }
    
    const slotInterval = slotIntervalMinutes ? parseInt(slotIntervalMinutes) : 30;
    const buffer = bufferAfter ? parseInt(bufferAfter) : 10;
    
    // Get free windows
    const freeWindows = await Availability.computeFreeWindows(
      dentalStaffId,
      date,
      duration,
      slotInterval,
      buffer
    );
    
    res.status(200).json({
      success: true,
      count: freeWindows.length,
      data: freeWindows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};