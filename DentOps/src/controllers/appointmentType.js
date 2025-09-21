const AppointmentType = require('../models/AppointmentType');
const { validationResult } = require('express-validator');

// @desc    Get all appointment types
// @route   GET /appointment-types
// @access  Private
exports.getAppointmentTypes = async (req, res) => {
  try {
    const appointmentTypes = await AppointmentType.find({})
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: appointmentTypes.length,
      data: appointmentTypes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single appointment type
// @route   GET /appointment-types/:id
// @access  Private
exports.getAppointmentType = async (req, res) => {
  try {
    const appointmentType = await AppointmentType.findById(req.params.id);

    if (!appointmentType) {
      return res.status(404).json({
        success: false,
        message: 'Appointment type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointmentType
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new appointment type
// @route   POST /appointment-types
// @access  Private (Dental Staff only)
exports.createAppointmentType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const appointmentType = await AppointmentType.create(req.body);

    res.status(201).json({
      success: true,
      data: appointmentType
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Appointment type with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update appointment type
// @route   PUT /appointment-types/:id
// @access  Private (Dental Staff only)
exports.updateAppointmentType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    let appointmentType = await AppointmentType.findById(req.params.id);

    if (!appointmentType) {
      return res.status(404).json({
        success: false,
        message: 'Appointment type not found'
      });
    }

    appointmentType = await AppointmentType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: appointmentType
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Appointment type with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete appointment type
// @route   DELETE /appointment-types/:id
// @access  Private (Dental Staff only)
exports.deleteAppointmentType = async (req, res) => {
  try {
    const appointmentType = await AppointmentType.findById(req.params.id);

    if (!appointmentType) {
      return res.status(404).json({
        success: false,
        message: 'Appointment type not found'
      });
    }

    // Soft delete by setting isActive to false
    appointmentType.isActive = false;
    await appointmentType.save();

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
