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
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTimeOfDay: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
AvailabilitySchema.index({ dentalStaffId: 1, weekday: 1 });

// Static method to create availability block
AvailabilitySchema.statics.createBlock = async function(dentalStaffId, weekday, startTimeOfDay, endTimeOfDay, isRecurring = true, startDate = null, endDate = null) {
  return await this.create({
    dentalStaffId,
    weekday,
    startTimeOfDay,
    endTimeOfDay,
    isRecurring,
    startDate,
    endDate
  });
};

// Static method to list availability for a specific date
AvailabilitySchema.statics.listForDate = async function(dentalStaffId, date) {
  const targetDate = new Date(date);
  const weekday = targetDate.getDay();
  
  // Find recurring availability for this weekday
  const recurringAvailability = await this.find({
    dentalStaffId,
    weekday,
    isRecurring: true
  }).sort({ startTimeOfDay: 1 });
  
  // Find non-recurring availability that covers this date
  const nonRecurringAvailability = await this.find({
    dentalStaffId,
    isRecurring: false,
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate }
  }).sort({ startTimeOfDay: 1 });
  
  // Combine both types
  return [...recurringAvailability, ...nonRecurringAvailability];
};

// Static method to compute free windows
AvailabilitySchema.statics.computeFreeWindows = async function(dentalStaffId, date, durationMinutes, slotIntervalMinutes = 30, bufferAfter = 10) {
  const targetDate = new Date(date);
  const weekday = targetDate.getDay();
  
  // Get availability blocks for this day
  const availabilityBlocks = await this.listForDate(dentalStaffId, targetDate);
  
  if (availabilityBlocks.length === 0) {
    return [];
  }
  
  // Get existing appointments for this day
  const Appointment = mongoose.model('Appointment');
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingAppointments = await Appointment.find({
    dentalStaffId,
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['CONFIRMED', 'PENDING'] }
  }).sort({ startTime: 1 });
  
  const freeWindows = [];
  
  for (const block of availabilityBlocks) {
    const blockStart = new Date(targetDate);
    const [startHour, startMin] = block.startTimeOfDay.split(':').map(Number);
    blockStart.setHours(startHour, startMin, 0, 0);
    
    const blockEnd = new Date(targetDate);
    const [endHour, endMin] = block.endTimeOfDay.split(':').map(Number);
    blockEnd.setHours(endHour, endMin, 0, 0);
    
    // Generate potential slots within this block
    let currentTime = new Date(blockStart);
    
    while (currentTime < blockEnd) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
      
      if (slotEnd <= blockEnd) {
        // Check if this slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.startTime);
          const appointmentEnd = new Date(appointment.endTime);
          
          return (currentTime < appointmentEnd && slotEnd > appointmentStart);
        });
        
        if (!hasConflict) {
          freeWindows.push({
            start: new Date(currentTime),
            end: new Date(slotEnd)
          });
        }
      }
      
      // Move to next potential slot
      currentTime = new Date(currentTime.getTime() + slotIntervalMinutes * 60000);
    }
  }
  
  return freeWindows;
};

module.exports = mongoose.model('Availability', AvailabilitySchema);
