const mongoose = require('mongoose');
const AppointmentType = require('../models/AppointmentType');
require('dotenv').config();

const appointmentTypes = [
  {
    name: 'Checkup',
    durationMinutes: 30,
    description: 'Regular dental checkup and cleaning'
  },
  {
    name: 'Filling',
    durationMinutes: 45,
    description: 'Dental filling procedure'
  },
  {
    name: 'Root Canal',
    durationMinutes: 90,
    description: 'Root canal treatment'
  },
  {
    name: 'Extraction',
    durationMinutes: 30,
    description: 'Tooth extraction'
  },
  {
    name: 'Crown',
    durationMinutes: 60,
    description: 'Dental crown placement'
  },
  {
    name: 'Consultation',
    durationMinutes: 15,
    description: 'Initial consultation'
  }
];

const seedAppointmentTypes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing appointment types
    await AppointmentType.deleteMany({});
    console.log('Cleared existing appointment types');

    // Insert new appointment types
    const createdTypes = await AppointmentType.insertMany(appointmentTypes);
    console.log(`Created ${createdTypes.length} appointment types:`);
    
    createdTypes.forEach(type => {
      console.log(`- ${type.name} (${type.durationMinutes} minutes)`);
    });

    console.log('Appointment types seeded successfully!');
  } catch (error) {
    console.error('Error seeding appointment types:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedAppointmentTypes();
