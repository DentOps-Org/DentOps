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

/**
 * Validates phone number format
 * Rules:
 * - Exactly 11 digits
 * - Strips non-numeric characters automatically
 * - Returns sanitized phone number if valid
 */
function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Strip all non-numeric characters
  const sanitized = phone.toString().replace(/\D/g, '');
  
  // Check if exactly 11 digits
  if (sanitized.length !== 11) {
    return { 
      valid: false, 
      message: 'Phone number must be exactly 11 digits' 
    };
  }
  
  // All checks passed - return sanitized phone
  return { 
    valid: true, 
    message: 'Phone number is valid',
    sanitizedPhone: sanitized
  };
}

module.exports = {
  validatePassword,
  validateEmail,
  validatePhone
};
