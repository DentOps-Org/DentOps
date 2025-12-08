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
    enum: ['NOTE', 'PRESCRIPTION', 'XRAY', 'OTHER'], 
    default: 'OTHER' 
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for fast lookup
PatientRecordSchema.index({ patientId: 1, uploadedAt: -1 });

module.exports = mongoose.model('PatientRecord', PatientRecordSchema);
