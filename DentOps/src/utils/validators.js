/**
 * VALIDATION UTILITIES
 * 
 * These functions validate user input for password and email.
 * We'll test these to make sure validation works correctly!
 */

/**
 * Validates password strength
 * Rules:
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains a number
 */
function validatePassword(password) {
  // Branch 1: Check length
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  // Branch 2: Check for uppercase
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' };
  }
  
  // Branch 3: Check for number
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  
  // All checks passed!
  return { valid: true, message: 'Password is valid' };
}

/**
 * Validates email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true, message: 'Email is valid' };
}

module.exports = {
  validatePassword,
  validateEmail
};
