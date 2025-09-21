const PatientRecord = require('../models/PatientRecord');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Export upload middleware
exports.upload = upload.single('file');

// @desc    Get patient records
// @route   GET /api/records
// @access  Private
exports.getRecords = async (req, res) => {
  try {
    const { patientId, type, appointmentId } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by patient
    if (patientId) {
      // If user is a patient, they can only view their own records
      if (req.user.role === 'PATIENT' && patientId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access these records'
        });
      }
      
      query.patientId = patientId;
    } else if (req.user.role === 'PATIENT') {
      // If no patientId provided and user is a patient, only show their records
      query.patientId = req.user.id;
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by appointment
    if (appointmentId) {
      query.appointmentId = appointmentId;
    }
    
    // Filter out archived records by default
    if (!req.query.includeArchived) {
      query.isArchived = false;
    }
    
    // Execute query with populated fields
    const records = await PatientRecord.find(query)
      .populate('patientId', 'fullName')
      .populate('uploadedBy', 'fullName')
      .populate('appointmentId', 'startTime endTime')
      .sort({ uploadedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single patient record
// @route   GET /api/records/:id
// @access  Private
exports.getRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id)
      .populate('patientId', 'fullName')
      .populate('uploadedBy', 'fullName')
      .populate('appointmentId', 'startTime endTime');
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    // Check if user has permission to view this record
    if (req.user.role === 'PATIENT' && record.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this record'
      });
    }
    
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new patient record
// @route   POST /api/records
// @access  Private (Both Dental Staff and Patients)
exports.createRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user.id);
    
    const { patientId, type, title, description, appointmentId, notes, tags } = req.body;
    
    // Determine patient ID based on user role
    let targetPatientId = patientId;
    if (req.user.role === 'PATIENT') {
      // Patients can only create records for themselves
      targetPatientId = req.user.id;
    }
    
    console.log('Target patient ID:', targetPatientId);
    console.log('Record type:', type);
    console.log('Record title:', title);
    
    // Check if patient exists and has PATIENT role
    const patient = await User.findById(targetPatientId);
    if (!patient || patient.role !== 'PATIENT') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient'
      });
    }
    
    // Handle file upload if provided
    let fileData = {};
    if (req.file) {
      // Set file data from multer
      fileData = {
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
      console.log('File uploaded:', fileData);
    }
    
    // Determine if this is a clinical record
    const isClinicalRecord = req.user.role === 'DENTAL_STAFF' && 
      ['NOTE', 'PRESCRIPTION', 'XRAY', 'LAB_RESULT'].includes(type);
    
    // Create record
    const record = await PatientRecord.create({
      patientId: targetPatientId,
      type,
      title,
      description,
      appointmentId,
      notes,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.user.id,
      uploadedByRole: req.user.role,
      isClinicalRecord,
      ...fileData
    });
    
    // Populate fields for response
    const populatedRecord = await PatientRecord.findById(record._id)
      .populate('patientId', 'fullName')
      .populate('uploadedBy', 'fullName')
      .populate('appointmentId', 'startTime endTime');
    
    res.status(201).json({
      success: true,
      data: populatedRecord
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update patient record
// @route   PUT /api/records/:id
// @access  Private (Dental Staff can update all, Patients can update their own non-clinical records)
exports.updateRecord = async (req, res) => {
  try {
    let record = await PatientRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'PATIENT') {
      // Patients can only update their own non-clinical records
      if (record.patientId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this record'
        });
      }
      if (record.isClinicalRecord) {
        return res.status(403).json({
          success: false,
          message: 'Cannot update clinical records'
        });
      }
    }
    
    // Process tags if provided
    if (req.body.tags) {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    // Update record
    record = await PatientRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patientId', 'fullName')
      .populate('uploadedBy', 'fullName')
      .populate('appointmentId', 'startTime endTime');
    
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete patient record
// @route   DELETE /api/records/:id
// @access  Private (Dental Staff can delete all, Patients can delete their own non-clinical records)
exports.deleteRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'PATIENT') {
      // Patients can only delete their own non-clinical records
      if (record.patientId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this record'
        });
      }
      if (record.isClinicalRecord) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete clinical records'
        });
      }
    }
    
    // If record has a file, delete it
    if (record.fileUrl) {
      const filePath = path.join(__dirname, '../../', record.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await record.remove();
    
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

// @desc    Archive patient record
// @route   PUT /api/records/:id/archive
// @access  Private (Dental Staff only)
exports.archiveRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    // Only dental staff can archive records
    if (req.user.role !== 'DENTAL_STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to archive records'
      });
    }
    
    record.isArchived = true;
    await record.save();
    
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Download patient record file
// @route   GET /api/records/:id/download
// @access  Private
exports.downloadRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    // Check if user has permission to download this record
    if (req.user.role === 'PATIENT' && record.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this record'
      });
    }
    
    // Check if record has a file
    if (!record.fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'No file associated with this record'
      });
    }
    
    const filePath = path.join(__dirname, '../../', record.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Send file
    res.download(filePath, record.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
