/**
 * INTEGRATION TESTS for Authentication API
 * 
 * These tests check if the ENTIRE authentication flow works:
 * - HTTP request → Routes → Controllers → Database → Response
 * 
 * We use:
 * - supertest: Makes HTTP requests to our API
 * - Real MongoDB (or in-memory for testing)
 * 
 * These are SLOWER than unit tests but test real workflows!
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');

// Setup and teardown
describe('Authentication API - Integration Tests', () => {
  
  // Before all tests: Connect to test database
  beforeAll(async () => {
    // Use test database (you can also use mongodb-memory-server)
    const testDbUri = process.env.MONGO_URI; // Use same DB as development
    
    try {
      await mongoose.connect(testDbUri);
      console. log('✅ Connected to MongoDB for integration tests');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB for integration tests');
      throw error; // Fail tests if MongoDB unavailable
    }
  });

  // After each test: Clean up database
  afterEach(async () => {
    await User.deleteMany({});
  });

  // After all tests: Disconnect
  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * TEST 1: User Registration
   * Tests: POST /auth/register
   */
  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '1234567890', // Updated to 10 digits
        role: 'PATIENT'
      });

    // Check HTTP status
    expect(response.status).toBe(201);
    
    // Check response body
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('john@example.com');
    expect(response.body.user.fullName).toBe('John Doe');
    
    // Verify user actually exists in database
    const user = await User.findOne({ email: 'john@example.com' });
    expect(user).toBeDefined();
    expect(user.fullName).toBe('John Doe');
    expect(user.role).toBe('PATIENT');
  }, 15000); // 15 second timeout for email sending

  /**
   * TEST 2: User Login
   * Tests: POST /auth/login
   */
  test('should login existing user and return token', async () => {
    // First, create a user
    await request(app)
      .post('/auth/register')
      .send({
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123',
        phone: '2345678901', // Updated to 10 digits
        role: 'PATIENT'
      });

    // Then, try to login
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'Password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('jane@example.com');
  }, 15000); // 15 second timeout for email sending

  /**
   * TEST 3: Login with Wrong Password (Negative Test)
   * Tests error handling
   */
  test('should fail login with incorrect password', async () => {
    // Create user
    await request(app)
      .post('/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'CorrectPassword123',
        phone: '3456789012', // Updated to 10 digits
        role: 'PATIENT'
      });

    // Try login with wrong password
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123'
      });

    expect(response.status).toBe(401); // Unauthorized
    expect(response.body.success).toBe(false);
  }, 15000); // 15 second timeout for email sending

  /**
   * TEST 4: Access Protected Route
   * Tests: GET /auth/me (requires authentication)
   */
  test('should access protected route with valid token', async () => {
    // Register and get token
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        fullName: 'Protected User',
        email: 'protected@example.com',
        password: 'Password123',
        phone: '4567890123', // Updated to 10 digits
        role: 'DENTAL_STAFF',
        specialization: 'DENTIST'
      });

    const token = registerResponse.body.token;

    // Try to access protected route
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`); // Add token to header

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('protected@example.com');
    expect(response.body.data.role).toBe('DENTAL_STAFF');
    expect(response.body.data.specialization).toBe('DENTIST');
  }, 15000); // 15 second timeout for email sending

  /**
   * TEST 5: Protected Route Without Token (Negative Test)
   */
  test('should reject protected route without token', async () => {
    const response = await request(app)
      .get('/auth/me');
      // No Authorization header

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

/**
 * HOW TO RUN:
 * 
 * 1. Make sure MongoDB is running:
 *    - Local: mongod
 *    - Or set MONGO_TEST_URI in .env
 * 
 * 2. Run tests:
 *    npm test auth.integration
 * 
 * WHAT YOU'LL SEE:
 * ✓ should register a new user successfully (250ms)
 * ✓ should login existing user and return token (180ms)
 * ✓ should fail login with incorrect password (150ms)
 * 
 * Note: Integration tests are SLOWER because they hit the real database!
 */
