const AppointmentType = require('../models/AppointmentType');
const Appointment = require('../models/Appointment'); // ModelName: Appointment
const { validationResult } = require('express-validator');

// @desc    Get all appointment types (active + inactive)
// @route   GET /appointment-types
// @access  Private (authenticated users)
exports.getAppointmentTypes = async (req, res) => {
  try {
    const appointmentTypes = await AppointmentType.find({}).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: appointmentTypes.length,
      data: appointmentTypes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single appointment type
// @route   GET /appointment-types/:id
// @access  Private
exports.getAppointmentType = async (req, res) => {
  try {
    const appointmentType = await AppointmentType.findById(req.params.id);

    if (!appointmentType) {
      return res.status(404).json({ success: false, message: 'Appointment type not found' });
    }

    res.status(200).json({ success: true, data: appointmentType });
  } catch (error) {
    console.error(error);
    // handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Appointment type not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new appointment type
// @route   POST /appointment-types
// @access  Private (Clinic Manager only)
exports.createAppointmentType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const appointmentType = await AppointmentType.create(req.body);
    res.status(201).json({ success: true, data: appointmentType });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Appointment type with this name already exists' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update appointment type (including toggling isActive)
// @route   PUT /appointment-types/:id
// @access  Private (Clinic Manager only)
exports.updateAppointmentType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let appointmentType = await AppointmentType.findById(req.params.id);

    if (!appointmentType) {
      return res.status(404).json({ success: false, message: 'Appointment type not found' });
    }

    appointmentType = await AppointmentType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: appointmentType });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Appointment type with this name already exists' });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Appointment type not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete appointment type (HARD DELETE if not in use)
// @route   DELETE /appointment-types/:id
// @access  Private (Clinic Manager only)
exports.deleteAppointmentType = async (req, res) => {
  try {
    const appointmentType = await AppointmentType.findById(req.params.id);

    if (!appointmentType) {
      return res.status(404).json({ success: false, message: 'Appointment type not found' });
    }

    // Check if any appointment references this appointment type
    //TODO:check this out 
    const inUse = await Appointment.exists({ [/* field name */ 'appointmentType']: appointmentType._id });

    if (inUse) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete — appointment type is in use by one or more appointments'
      });
    }

    // Not in use -> hard delete
    await appointmentType.deleteOne();

    res.status(200).json({ success: true, message: 'Appointment type deleted' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Appointment type not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
