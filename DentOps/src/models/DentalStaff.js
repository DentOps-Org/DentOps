const mongoose = require('mongoose');

const DentalStaffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DentalStaff'
  },
  specialization: {
    type: String,
    enum: ['DENTIST', 'MANAGER'],
    default: 'DENTIST'
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.specialization === 'DENTIST';
    }
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to ensure the referenced user has DENTAL_STAFF role
DentalStaffSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    
    if (!user) {
      throw new Error('Referenced user does not exist');
    }
    
    if (user.role !== 'DENTAL_STAFF') {
      throw new Error('Referenced user must have DENTAL_STAFF role');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
DentalStaffSchema.methods.viewPendingAppointments = async function() {
  const Appointment = mongoose.model('Appointment');
  return await Appointment.find({ 
    status: 'PENDING',
    dentalStaffId: this.userId 
  }).populate('patientId appointmentTypeId');
};

DentalStaffSchema.methods.approveAppointment = async function(appointmentId, startTime, endTime) {
  const Appointment = mongoose.model('Appointment');
  return await Appointment.confirm(appointmentId, startTime, endTime, this.userId);
};

DentalStaffSchema.methods.createAppointmentForPatient = async function(patientId, appointmentTypeId, startTime) {
  const Appointment = mongoose.model('Appointment');
  const AppointmentType = mongoose.model('AppointmentType');
  
  const appointmentType = await AppointmentType.findById(appointmentTypeId);
  if (!appointmentType) {
    throw new Error('Appointment type not found');
  }
  
  const endTime = new Date(startTime.getTime() + appointmentType.durationMinutes * 60000);
  
  return await Appointment.create({
    patientId,
    dentalStaffId: this.userId,
    appointmentTypeId,
    startTime,
    endTime,
    status: 'CONFIRMED'
  });
};

DentalStaffSchema.methods.cancelAppointment = async function(appointmentId, reason) {
  const Appointment = mongoose.model('Appointment');
  return await Appointment.cancel(appointmentId, reason);
};

DentalStaffSchema.methods.markCompleted = async function(appointmentId) {
  const Appointment = mongoose.model('Appointment');
  return await Appointment.complete(appointmentId);
};

DentalStaffSchema.methods.markNoShow = async function(appointmentId) {
  const Appointment = mongoose.model('Appointment');
  return await Appointment.markNoShow(appointmentId);
};

DentalStaffSchema.methods.manageInventory = async function(itemId, delta) {
  const InventoryItem = mongoose.model('InventoryItem');
  return await InventoryItem.adjustQuantity(itemId, delta, this.userId);
};

DentalStaffSchema.methods.createPatientRecord = async function(patientId, appointmentId, meta) {
  const PatientRecord = mongoose.model('PatientRecord');
  return await PatientRecord.createPatientRecord(this.userId, patientId, appointmentId, meta);
};

DentalStaffSchema.methods.setAvailability = async function(block) {
  const Availability = mongoose.model('Availability');
  return await Availability.createBlock(this.userId, block.weekday, block.startTimeOfDay, block.endTimeOfDay, block.isRecurring, block.startDate, block.endDate);
};

DentalStaffSchema.methods.getAvailability = async function(date) {
  const Availability = mongoose.model('Availability');
  return await Availability.listForDate(this.userId, date);
};

DentalStaffSchema.methods.getFreeWindows = async function(date, appointmentTypeId) {
  const Availability = mongoose.model('Availability');
  const AppointmentType = mongoose.model('AppointmentType');
  
  const appointmentType = await AppointmentType.findById(appointmentTypeId);
  if (!appointmentType) {
    throw new Error('Appointment type not found');
  }
  
  return await Availability.computeFreeWindows(this.userId, date, appointmentType.durationMinutes, 30, 10);
};

module.exports = mongoose.model('DentalStaff', DentalStaffSchema);
