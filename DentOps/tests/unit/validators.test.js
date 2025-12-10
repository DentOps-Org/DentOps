const { validatePhone } = require('../../src/utils/validators');

describe('Phone Validation', () => {
  test('should accept valid 11-digit phone number', () => {
    const result = validatePhone('12345678901');
    expect(result.valid).toBe(true);
    expect(result.sanitizedPhone).toBe('12345678901');
  });

  test('should strip non-numeric characters and validate', () => {
    const result = validatePhone('123-456-789-01');
    expect(result.valid).toBe(true);
    expect(result.sanitizedPhone).toBe('12345678901');
  });

  test('should strip spaces and validate', () => {
    const result = validatePhone('123 456 789 01');
    expect(result.valid).toBe(true);
    expect(result.sanitizedPhone).toBe('12345678901');
  });

  test('should strip parentheses and validate', () => {
    const result = validatePhone('(123) 456-7890-1');
    expect(result.valid).toBe(true);
    expect(result.sanitizedPhone).toBe('12345678901');
  });

  test('should reject phone number with less than 11 digits', () => {
    const result = validatePhone('1234567890');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Phone number must be exactly 11 digits');
  });

  test('should reject phone number with more than 11 digits', () => {
    const result = validatePhone('123456789012');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Phone number must be exactly 11 digits');
  });

  test('should reject empty phone number', () => {
    const result = validatePhone('');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Phone number is required');
  });

  test('should reject null phone number', () => {
    const result = validatePhone(null);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Phone number is required');
  });

  test('should reject undefined phone number', () => {
    const result = validatePhone(undefined);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Phone number is required');
  });

  test('should handle phone number as number type', () => {
    const result = validatePhone(12345678901);
    expect(result.valid).toBe(true);
    expect(result.sanitizedPhone).toBe('12345678901');
  });

  test('should reject phone with only letters', () => {
    const result = validatePhone('abcdefghijk');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Phone number must be exactly 11 digits');
  });

  test('should strip letters and validate remaining digits', () => {
    const result = validatePhone('123abc456def789gh01');
    expect(result.valid).toBe(true);
    expect(result.sanitizedPhone).toBe('12345678901');
  });
});
