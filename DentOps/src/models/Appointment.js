const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  dentalStaffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Not required for PENDING appointments
  },
  appointmentTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppointmentType',
    required: true
  },
  requestedDate: {
    type: Date,
    required: true
  },
  startTime: { 
    type: Date, 
    required: false // Not required for PENDING appointments
  },
  endTime: { 
    type: Date, 
    required: false // Not required for PENDING appointments
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'], 
    default: 'PENDING' 
  },
  notes: { 
    type: String 
  },
  cancellationReason: {
    type: String
  },
  availabilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Availability',
    required: false // Optional reference to availability block
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date 
  }
});

// Create index for faster conflict checking
AppointmentSchema.index({ dentalStaffId: 1, startTime: 1, endTime: 1 });

// Update the updatedAt field before saving
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create appointment request
AppointmentSchema.statics.createRequest = async function(patientId, appointmentTypeId, requestedDate) {
  return await this.create({
    patientId,
    appointmentTypeId,
    requestedDate,
    status: 'PENDING'
  });
};

// Static method to confirm appointment
AppointmentSchema.statics.confirm = async function(appointmentId, startTime, endTime, dentalStaffId) {
  const appointment = await this.findById(appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.status !== 'PENDING') {
    throw new Error('Only pending appointments can be confirmed');
  }
  
  appointment.dentalStaffId = dentalStaffId;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.status = 'CONFIRMED';
  
  return await appointment.save();
};

// Instance methods
AppointmentSchema.methods.confirm = async function(startTime, endTime, dentalStaffId) {
  if (this.status !== 'PENDING') {
    throw new Error('Only pending appointments can be confirmed');
  }
  
  this.dentalStaffId = dentalStaffId;
  this.startTime = startTime;
  this.endTime = endTime;
  this.status = 'CONFIRMED';
  
  return await this.save();
};

AppointmentSchema.methods.cancel = async function(reason) {
  if (this.status === 'CANCELLED') {
    throw new Error('Appointment is already cancelled');
  }
  
  if (this.status === 'COMPLETED') {
    throw new Error('Cannot cancel completed appointment');
  }
  
  this.status = 'CANCELLED';
  this.cancellationReason = reason;
  
  return await this.save();
};

AppointmentSchema.methods.complete = async function() {
  if (this.status !== 'CONFIRMED') {
    throw new Error('Only confirmed appointments can be completed');
  }
  
  this.status = 'COMPLETED';
  return await this.save();
};

AppointmentSchema.methods.markNoShow = async function() {
  if (this.status !== 'CONFIRMED') {
    throw new Error('Only confirmed appointments can be marked as no-show');
  }
  
  this.status = 'NO_SHOW';
  return await this.save();
};

// Static method to check for conflicts
AppointmentSchema.statics.checkConflict = async function(dentalStaffId, startTime, endTime, excludeId = null) {
  const query = {
    dentalStaffId,
    $or: [
      // New appointment starts during an existing one
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ],
    status: { $in: ['PENDING', 'CONFIRMED'] }
  };

  // Exclude the current appointment if we're updating
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflict = await this.findOne(query);
  return conflict;
};

// Instance method to check if this appointment conflicts with others
AppointmentSchema.methods.hasConflict = async function() {
  if (!this.dentalStaffId || !this.startTime || !this.endTime) {
    return false; // No conflict if not fully scheduled
  }
  
  return await this.constructor.checkConflict(
    this.dentalStaffId, 
    this.startTime, 
    this.endTime,
    this._id
  );
};

// Middleware to check for conflicts before saving
AppointmentSchema.pre('save', async function(next) {
  if (this.isModified('dentalStaffId') || this.isModified('startTime') || this.isModified('endTime')) {
    if (this.dentalStaffId && this.startTime && this.endTime) {
      const conflict = await this.hasConflict();
      if (conflict) {
        const error = new Error('Dental staff already has an appointment during this time');
        error.name = 'ConflictError';
        return next(error);
      }
    }
  }
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
