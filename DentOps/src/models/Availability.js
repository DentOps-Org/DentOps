const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  dentalStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekday: {
    type: Number,
    required: true,
    min: 0, // Sunday
    max: 6  // Saturday
  },
  startTimeOfDay: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // "HH:MM"
  },
  endTimeOfDay: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // "HH:MM"
  }
}, { timestamps: true });

// enforce one block per weekday per dental staff //TODO:whats this ??
AvailabilitySchema.index({ dentalStaffId: 1, weekday: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);