const PatientRecord = require('../models/PatientRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get patient records
// @route   GET /api/records
// @access  Private
exports.getRecords = async (req, res) => {
  try {
    const { patientEmail, type, appointmentId } = req.query;
    const query = {};

    if (req.user.role === 'PATIENT') {
      //Patients → only their own records
      query.patientId = req.user.id;

    } else if (req.user.role === 'DENTAL_STAFF') {
      // Dentists can either:
      // 1. See all records they created (no email provided)
      // 2. Search for a specific patient by email
      
      if (patientEmail) {
        // Find the patient by email
        const patient = await User.findOne({ email: patientEmail, role: 'PATIENT' });
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient with this email not found.'
          });
        }
        query.patientId = patient._id;
      }
      
      // Always filter by records created by this dentist
      query.uploadedBy = req.user.id;

    } else {
      // 👨‍💼 For managers/admins (if any)
      if (patientEmail) {
        const patient = await User.findOne({ email: patientEmail, role: 'PATIENT' });
        if (patient) query.patientId = patient._id;
      }
    }

    // Optional filters
    if (type) query.type = type;
    if (appointmentId) query.appointmentId = appointmentId;

    // Fetch results
    const records = await PatientRecord.find(query)
      .populate('patientId', 'fullName email')
      .populate('uploadedBy', 'fullName role')
      .populate('appointmentId', 'startTime endTime')
      .sort({ uploadedAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


// ✅ Get single record
exports.getRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id)
      .populate('patientId', 'fullName')
      .populate('uploadedBy', 'fullName')
      .populate('appointmentId', 'startTime endTime');

    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    // permission check
    const user = req.user;
    if (user.role === 'PATIENT' && record.patientId._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (user.role === 'DENTIST') {//TODO:changed to dentist here
      const appt = await Appointment.findOne({
        _id: record.appointmentId,
        dentalStaffId: user._id
      });
      if (!appt) return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Create record (Patient or Dentist)
exports.createRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const user = req.user;
    const { patientId, appointmentId, type, title, description } = req.body;

    let finalPatientId = patientId;

    // if patient uploads, enforce own ID
    if (user.role === 'PATIENT') {
      finalPatientId = user._id;
    }

    const record = await PatientRecord.create({
      patientId: finalPatientId,
      appointmentId,
      uploadedBy: user._id,
      type,
      title,
      description
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Update record (only uploader or same patient)
exports.updateRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    const user = req.user;

    // allow only uploader or the patient
    if (
      record.uploadedBy.toString() !== user._id.toString() &&
      record.patientId.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await PatientRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Delete record (only uploader or patient)
exports.deleteRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    const user = req.user;
    if (
      record.uploadedBy.toString() !== user._id.toString() &&
      record.patientId.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await record.remove();
    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};