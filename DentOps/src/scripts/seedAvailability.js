const mongoose = require('mongoose');
const User = require('../models/User');
const ProviderAvailability = require('../models/ProviderAvailability');
require('dotenv').config();

const seedAvailability = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all dental staff users
    const dentalStaff = await User.find({ role: 'DENTAL_STAFF' });
    console.log(`Found ${dentalStaff.length} dental staff users`);

    if (dentalStaff.length === 0) {
      console.log('No dental staff found. Please create some dental staff users first.');
      return;
    }

    // Clear existing availability
    await ProviderAvailability.deleteMany({});
    console.log('Cleared existing availability blocks');

    // Create availability for each dental staff member
    for (const staff of dentalStaff) {
      console.log(`Creating availability for ${staff.fullName}...`);
      
      // Monday to Friday, 9 AM to 5 PM
      const availabilityBlocks = [
        { weekday: 1, startTimeOfDay: '09:00', endTimeOfDay: '17:00' }, // Monday
        { weekday: 2, startTimeOfDay: '09:00', endTimeOfDay: '17:00' }, // Tuesday
        { weekday: 3, startTimeOfDay: '09:00', endTimeOfDay: '17:00' }, // Wednesday
        { weekday: 4, startTimeOfDay: '09:00', endTimeOfDay: '17:00' }, // Thursday
        { weekday: 5, startTimeOfDay: '09:00', endTimeOfDay: '17:00' }, // Friday
      ];

      for (const block of availabilityBlocks) {
        await ProviderAvailability.create({
          providerId: staff._id,
          ...block,
          isRecurring: true
        });
      }
      
      console.log(`Created ${availabilityBlocks.length} availability blocks for ${staff.fullName}`);
    }

    console.log('Availability seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding availability:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedAvailability();
