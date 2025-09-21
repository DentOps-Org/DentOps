const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const AppointmentType = require('../models/AppointmentType');
require('dotenv').config();

const createTestAppointment = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get a patient and provider
    const patient = await User.findOne({ role: 'PATIENT' });
    const provider = await User.findOne({ role: 'DENTAL_STAFF' });
    const appointmentType = await AppointmentType.findOne({ name: 'Checkup' });

    if (!patient || !provider || !appointmentType) {
      console.log('Missing required data:', { patient: !!patient, provider: !!provider, appointmentType: !!appointmentType });
      return;
    }

    // Create appointment for today at 2 PM IST
    const today = new Date();
    const startTime = new Date(today);
    startTime.setHours(14, 0, 0, 0); // 2 PM IST
    
    // Convert to UTC (subtract 5:30 hours)
    const istOffsetMinutes = 5 * 60 + 30;
    const startTimeUTC = new Date(startTime.getTime() - (istOffsetMinutes * 60000));
    const endTimeUTC = new Date(startTimeUTC.getTime() + (appointmentType.durationMinutes * 60000));

    const appointment = await Appointment.create({
      patientId: patient._id,
      providerId: provider._id,
      appointmentTypeId: appointmentType._id,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      reason: 'Test appointment for today',
      status: 'CONFIRMED',
      createdBy: provider._id
    });

    console.log('Test appointment created:', {
      id: appointment._id,
      patient: patient.fullName,
      provider: provider.fullName,
      type: appointmentType.name,
      startTime: appointment.startTime,
      status: appointment.status
    });

  } catch (error) {
    console.error('Error creating test appointment:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the function
createTestAppointment();
