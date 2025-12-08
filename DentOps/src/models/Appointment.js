const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dentalStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointmentTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppointmentType',
    required: true
  },
  // date patient requested (date only)
  requestedDate: {
    type: Date,
    required: true
  },
  // scheduled times (set when CONFIRMED)
  startTime: { type: Date },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING'
  },
  notes: { type: String },
  cancellationReason: { type: String }
}, { timestamps: true });

// Index for fast conflict queries
AppointmentSchema.index({ dentalStaffId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);