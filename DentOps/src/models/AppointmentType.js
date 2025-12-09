const mongoose = require('mongoose');

const AppointmentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 15,
    max: 300
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AppointmentType', AppointmentTypeSchema);
