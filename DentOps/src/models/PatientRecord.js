const mongoose = require('mongoose');

const PatientRecordSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  type: { 
    type: String, 
    enum: ['XRAY', 'NOTE', 'PRESCRIPTION', 'LAB_RESULT', 'CONSENT_FORM', 'OTHER'], 
    default: 'OTHER' 
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileName: {
    type: String
  },
  fileUrl: {
    type: String
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create index for faster patient record lookups
PatientRecordSchema.index({ patientId: 1, uploadedAt: -1 });
PatientRecordSchema.index({ appointmentId: 1 });

// Middleware to ensure the referenced patient exists and has PATIENT role
PatientRecordSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const patient = await User.findById(this.patientId);
    
    if (!patient) {
      throw new Error('Referenced patient does not exist');
    }
    
    if (patient.role !== 'PATIENT') {
      throw new Error('Referenced user must have PATIENT role');
    }
    
    // Ensure uploadedBy is dental staff
    const uploader = await User.findById(this.uploadedBy);
    if (!uploader || uploader.role !== 'DENTAL_STAFF') {
      throw new Error('Only dental staff can upload patient records');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to create patient record
PatientRecordSchema.statics.createPatientRecord = async function(uploadedBy, patientId, appointmentId, meta) {
  return await this.create({
    uploadedBy,
    patientId,
    appointmentId,
    type: meta.type,
    title: meta.title,
    description: meta.description,
    fileName: meta.fileName,
    fileUrl: meta.fileUrl
  });
};

// Static method to update patient record
PatientRecordSchema.statics.updatePatientRecord = async function(recordId, data) {
  const record = await this.findById(recordId);
  if (!record) {
    throw new Error('Patient record not found');
  }
  
  Object.assign(record, data);
  return await record.save();
};

// Static method to delete patient record
PatientRecordSchema.statics.deletePatientRecord = async function(recordId) {
  const record = await this.findById(recordId);
  if (!record) {
    throw new Error('Patient record not found');
  }
  
  return await this.findByIdAndDelete(recordId);
};

// Static method to find records by patient email
PatientRecordSchema.statics.findByPatientEmail = async function(email) {
  const User = mongoose.model('User');
  const patient = await User.findOne({ email, role: 'PATIENT' });
  
  if (!patient) {
    return [];
  }
  
  return await this.find({ patientId: patient._id }).populate('appointmentId uploadedBy');
};

// Virtual for file extension
PatientRecordSchema.virtual('fileExtension').get(function() {
  if (!this.fileName) return null;
  const parts = this.fileName.split('.');
  return parts.length > 1 ? parts.pop() : null;
});

// Method to check if record has a file
PatientRecordSchema.methods.hasFile = function() {
  return !!this.fileUrl;
};

// Static method to find records by patient and type
PatientRecordSchema.statics.findByPatientAndType = function(patientId, type) {
  return this.find({ 
    patientId, 
    type
  }).sort({ uploadedAt: -1 });
};

// Static method to find records by appointment
PatientRecordSchema.statics.findByAppointment = function(appointmentId) {
  return this.find({ appointmentId }).sort({ uploadedAt: -1 });
};

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);
