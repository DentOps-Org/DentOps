const axios = require('axios');

const BASE_URL = 'http://localhost:5000/auth';

async function testPhoneValidation() {
  console.log('=== Testing Phone Number Validation ===\n');

  // Test 1: Valid 11-digit phone
  console.log('Test 1: Valid 11-digit phone (12345678901)');
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Test User 1',
      email: 'testuser1@example.com',
      password: 'password123',
      phone: '12345678901',
      role: 'PATIENT'
    });
    console.log('✅ SUCCESS:', response.data.success ? 'User registered' : 'Failed');
    console.log('   Phone stored:', response.data.user?.phone || 'N/A');
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
  }
  console.log('');

  // Test 2: Phone with formatting (should be sanitized)
  console.log('Test 2: Phone with dashes (123-456-789-01)');
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Test User 2',
      email: 'testuser2@example.com',
      password: 'password123',
      phone: '123-456-789-01',
      role: 'PATIENT'
    });
    console.log('✅ SUCCESS:', response.data.success ? 'User registered' : 'Failed');
    console.log('   Phone stored:', response.data.user?.phone || 'N/A');
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
  }
  console.log('');

  // Test 3: Invalid phone - too short (10 digits)
  console.log('Test 3: Invalid phone - too short (1234567890)');
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Test User 3',
      email: 'testuser3@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'PATIENT'
    });
    console.log('❌ UNEXPECTED SUCCESS - Should have failed');
  } catch (error) {
    console.log('✅ EXPECTED FAILURE:', error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message);
  }
  console.log('');

  // Test 4: Invalid phone - too long (12 digits)
  console.log('Test 4: Invalid phone - too long (123456789012)');
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Test User 4',
      email: 'testuser4@example.com',
      password: 'password123',
      phone: '123456789012',
      role: 'PATIENT'
    });
    console.log('❌ UNEXPECTED SUCCESS - Should have failed');
  } catch (error) {
    console.log('✅ EXPECTED FAILURE:', error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message);
  }
  console.log('');

  // Test 5: Invalid phone - letters
  console.log('Test 5: Invalid phone - with letters (abcd1234567)');
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Test User 5',
      email: 'testuser5@example.com',
      password: 'password123',
      phone: 'abcd1234567',
      role: 'PATIENT'
    });
    console.log('❌ UNEXPECTED SUCCESS - Should have failed');
  } catch (error) {
    console.log('✅ EXPECTED FAILURE:', error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message);
  }
  console.log('');

  // Test 6: Duplicate phone number
  console.log('Test 6: Duplicate phone number (12345678901 - same as Test 1)');
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Test User 6',
      email: 'testuser6@example.com',
      password: 'password123',
      phone: '12345678901',
      role: 'PATIENT'
    });
    console.log('❌ UNEXPECTED SUCCESS - Should have failed');
  } catch (error) {
    console.log('✅ EXPECTED FAILURE:', error.response?.data?.message || error.message);
  }
  console.log('');

  // Test 7: Missing phone number
  console.log('Test 7: Missing phone number');
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName: 'Test User 7',
      email: 'testuser7@example.com',
      password: 'password123',
      role: 'PATIENT'
    });
    console.log('❌ UNEXPECTED SUCCESS - Should have failed');
  } catch (error) {
    console.log('✅ EXPECTED FAILURE:', error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message);
  }
  console.log('');

  console.log('=== Phone Validation Tests Completed ===');
}

// Run the tests
testPhoneValidation().catch(console.error);
