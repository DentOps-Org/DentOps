/**
 * UNIT TESTS for Validation Utilities
 * 
 * These tests check if our password and email validation works correctly.
 * We test different "paths" through the code (path coverage).
 * 
 * How to read tests:
 * - describe() = groups related tests together
 * - test() or it() = individual test case
 * - expect() = assertion (what we expect to happen)
 */

const { validatePassword, validateEmail } = require('../../../src/utils/validators');

describe('Password Validation - Unit Tests', () => {
  
  // PATH 1: Password too short
  test('should fail when password is too short', () => {
    const result = validatePassword('abc');
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Password must be at least 8 characters');
  });

  // PATH 2: Password has no uppercase letter
  test('should fail when password has no uppercase', () => {
    const result = validatePassword('password123');
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Password must contain uppercase letter');
  });

  // PATH 3: Password has no number
  test('should fail when password has no number', () => {
    const result = validatePassword('Password');
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Password must contain a number');
  });

  // PATH 4: Valid password (all conditions met)
  test('should pass when password meets all requirements', () => {
    const result = validatePassword('Password123');
    
    expect(result.valid).toBe(true);
    expect(result.message).toBe('Password is valid');
  });

  // EDGE CASE: Exactly 8 characters
  test('should pass with exactly 8 characters if other conditions met', () => {
    const result = validatePassword('Pass1234');
    
    expect(result.valid).toBe(true);
  });
});

describe('Email Validation - Unit Tests', () => {
  
  // TEST 1: Valid email
  test('should pass with valid email format', () => {
    const result = validateEmail('test@example.com');
    
    expect(result.valid).toBe(true);
    expect(result.message).toBe('Email is valid');
  });

  // TEST 2: Empty email
  test('should fail when email is empty', () => {
    const result = validateEmail('');
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Email is required');
  });

  // TEST 3: Invalid format - no @
  test('should fail when email has no @ symbol', () => {
    const result = validateEmail('invalidemail.com');
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Invalid email format');
  });

  // TEST 4: Invalid format - no domain
  test('should fail when email has no domain', () => {
    const result = validateEmail('test@');
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Invalid email format');
  });
});

/**
 * HOW TO RUN THESE TESTS:
 * 
 * 1. Run all tests:
 *    npm test
 * 
 * 2. Run only this file:
 *    npm test validators
 * 
 * 3. Run with coverage:
 *    npm test -- --coverage
 * 
 * EXPECTED OUTPUT:
 * ✓ should fail when password is too short
 * ✓ should fail when password has no uppercase
 * ✓ should pass when password meets all requirements
 * ... etc
 */
