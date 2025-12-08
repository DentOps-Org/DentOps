const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAppointmentSystem() {
  try {
    console.log('🧪 Testing Appointment System...\n');
    
    // Step 1: Register a dentist
    console.log('1. Registering a dentist...');
    const dentistData = {
      fullName: 'Dr. John Smith',
      email: 'dr.smith@test.com',
      password: 'password123',
      role: 'DENTAL_STAFF',
      phone: '1234567890',
      age: 35,
      gender: 'MALE',
      specialization: 'DENTIST'
    };
    
    let dentistToken;
    try {
      const dentistResponse = await axios.post(`${BASE_URL}/auth/register`, dentistData);
      dentistToken = dentistResponse.data.token;
      console.log('✅ Dentist registered successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        // Try to login instead
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: dentistData.email,
          password: dentistData.password
        });
        dentistToken = loginResponse.data.token;
        console.log('✅ Dentist logged in successfully');
      } else {
        throw error;
      }
    }
    
    // Step 2: Register a patient
    console.log('\n2. Registering a patient...');
    const patientData = {
      fullName: 'Jane Doe',
      email: 'jane.doe@test.com',
      password: 'password123',
      role: 'PATIENT',
      phone: '0987654321',
      age: 28,
      gender: 'FEMALE'
    };
    
    let patientToken;
    try {
      const patientResponse = await axios.post(`${BASE_URL}/auth/register`, patientData);
      patientToken = patientResponse.data.token;
      console.log('✅ Patient registered successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        // Try to login instead
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: patientData.email,
          password: patientData.password
        });
        patientToken = loginResponse.data.token;
        console.log('✅ Patient logged in successfully');
      } else {
        throw error;
      }
    }
    
    // Step 3: Get dentist ID
    console.log('\n3. Getting dentist ID...');
    const dentistInfo = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${dentistToken}` }
    });
    const dentistId = dentistInfo.data.data._id;
    console.log(`✅ Dentist ID: ${dentistId}`);
    
    // Step 4: Set dentist availability
    console.log('\n4. Setting dentist availability...');
    const availabilityData = {
      dentistId: dentistId,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      bufferTime: 10,
      isActive: true
    };
    
    await axios.post(`${BASE_URL}/availability`, availabilityData, {
      headers: { Authorization: `Bearer ${dentistToken}` }
    });
    console.log('✅ Availability set for Monday 9:00-17:00');
    
    // Step 5: Get available slots
    console.log('\n5. Getting available slots...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const slotsResponse = await axios.get(`${BASE_URL}/availability/${dentistId}/slots?date=${dateStr}`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    
    console.log(`✅ Found ${slotsResponse.data.data.length} available slots`);
    if (slotsResponse.data.data.length > 0) {
      console.log('First slot:', slotsResponse.data.data[0]);
    }
    
    // Step 6: Book an appointment
    if (slotsResponse.data.data.length > 0) {
      console.log('\n6. Booking an appointment...');
      const slot = slotsResponse.data.data[0];
      
      const appointmentData = {
        providerId: dentistId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: 'Check-up',
        notes: 'Regular dental check-up'
      };
      
      const appointmentResponse = await axios.post(`${BASE_URL}/appointments`, appointmentData, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      
      console.log('✅ Appointment booked successfully!');
      console.log('Appointment ID:', appointmentResponse.data.data._id);
    } else {
      console.log('\n6. No slots available to book appointment');
    }
    
    console.log('\n🎉 Appointment system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAppointmentSystem();


