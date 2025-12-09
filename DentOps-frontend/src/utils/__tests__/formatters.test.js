/**
 * UNIT TESTS for Formatting Utilities
 * 
 * These test pure functions - no React, no DOM, just logic!
 * Perfect examples of simple unit tests.
 */

import { describe, test, expect } from 'vitest';
import { formatDate, formatCurrency, getStatusColor } from '../formatters';

describe('formatDate() - Unit Tests', () => {
  
  test('should format valid date correctly', () => {
    const result = formatDate('2024-12-15');
    expect(result).toBe('December 15, 2024');
  });

  test('should return N/A for null date', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  test('should return N/A for undefined date', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });

  test('should return N/A for empty string', () => {
    expect(formatDate('')).toBe('N/A');
  });
});

describe('formatCurrency() - Unit Tests', () => {
  
  test('should format positive amount correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  test('should format decimal amount correctly', () => {
    expect(formatCurrency(49.99)).toBe('$49.99');
  });

  test('should return $0.00 for zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('should return $0.00 for null', () => {
    expect(formatCurrency(null)).toBe('$0.00');
  });

  test('should return $0.00 for undefined', () => {
    expect(formatCurrency(undefined)).toBe('$0.00');
  });

  test('should handle negative amounts', () => {
    expect(formatCurrency(-25.50)).toBe('-$25.50');
  });
});

describe('getStatusColor() - Branch Coverage', () => {
  
  test('should return yellow for PENDING', () => {
    expect(getStatusColor('PENDING')).toBe('yellow');
  });

  test('should return blue for CONFIRMED', () => {
    expect(getStatusColor('CONFIRMED')).toBe('blue');
  });

  test('should return green for COMPLETED', () => {
    expect(getStatusColor('COMPLETED')).toBe('green');
  });

  test('should return red for CANCELLED', () => {
    expect(getStatusColor('CANCELLED')).toBe('red');
  });

  test('should return gray for unknown status', () => {
    expect(getStatusColor('UNKNOWN')).toBe('gray');
  });

  test('should return gray for empty string', () => {
    expect(getStatusColor('')).toBe('gray');
  });
});

/**
 * HOW TO RUN:
 * npm test formatters
 * 
 * These tests are FAST because they don't involve DOM or React!
 */
