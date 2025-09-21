const mongoose = require('mongoose');

const AppointmentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  durationMinutes: { // Duration in minutes
    type: Number,
    required: true,
    min: 15,
    max: 300 // Max 5 hours
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
AppointmentTypeSchema.index({ name: 1 });
AppointmentTypeSchema.index({ isActive: 1 });

module.exports = mongoose.model('AppointmentType', AppointmentTypeSchema);
