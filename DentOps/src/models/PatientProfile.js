const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  address: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  medicalNotes: { 
    type: String 
  },
  insuranceProvider: {
    type: String
  },
  insurancePolicyNumber: {
    type: String
  },
  insuranceDocumentUrl: {
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date 
  }
});

// Update the updatedAt field before saving
PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to ensure the referenced user has PATIENT role
PatientSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    
    if (!user) {
      throw new Error('Referenced user does not exist');
    }
    
    if (user.role !== 'PATIENT') {
      throw new Error('Referenced user must have PATIENT role');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
PatientSchema.methods.updateProfile = async function(data) {
  Object.assign(this, data);
  this.updatedAt = Date.now();
  return this.save();
};

PatientSchema.methods.bookAppointment = async function(appointmentTypeId, requestedDate) {
  const Appointment = mongoose.model('Appointment');
  return await Appointment.createRequest(this.userId, appointmentTypeId, requestedDate);
};

PatientSchema.methods.viewAppointments = async function() {
  const Appointment = mongoose.model('Appointment');
  return await Appointment.find({ patientId: this.userId }).populate('dentalStaffId appointmentTypeId');
};

PatientSchema.methods.viewPatientRecords = async function() {
  const PatientRecord = mongoose.model('PatientRecord');
  return await PatientRecord.find({ patientId: this.userId }).populate('appointmentId uploadedBy');
};

module.exports = mongoose.model('Patient', PatientSchema);
