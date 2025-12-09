/**
 * UNIT TESTS for Button Component
 * 
 * These tests check if our Button component works correctly.
 * We test rendering, clicking, disabled state, and variants.
 * 
 * How to read tests:
 * - describe() = groups related tests together
 * - test() or it() = individual test case
 * - expect() = assertion (what we expect to happen)
 * - render() = renders the component in test environment
 * - screen = queries for elements (like document.querySelector)
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component - Unit Tests', () => {
  
  /**
   * TEST 1: Rendering
   * Check if button renders with correct label
   */
  test('should render button with correct label', () => {
    render(<Button label="Click Me" />);
    
    // Query for button by its accessible role and name
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  /**
   * TEST 2: onClick Handler
   * Check if onClick function is called when button is clicked
   */
  test('should call onClick handler when clicked', () => {
    // Create a mock function (like a spy)
    const handleClick = vi.fn();
    
    render(<Button label="Submit" onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    
    // Simulate click
    fireEvent.click(button);
    
    // Check if function was called
    expect(handleClick).toHaveBeenCalled();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  /**
   * TEST 3: Disabled State
   * Check that disabled button doesn't trigger onClick
   */
  test('should not call onClick when button is disabled', () => {
    const handleClick = vi.fn();
    
    render(<Button label="Submit" onClick={handleClick} disabled={true} />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    
    // Button should be disabled
    expect(button).toBeDisabled();
    
    // Try to click
    fireEvent.click(button);
    
    // onClick should NOT be called
    expect(handleClick).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: CSS Classes - Primary Variant
   * Check if correct CSS classes are applied
   */
  test('should apply primary variant classes by default', () => {
    render(<Button label="Primary" />);
    
    const button = screen.getByRole('button', { name: /primary/i });
    
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('text-white');
  });

  /**
   * TEST 5: CSS Classes - Danger Variant
   */
  test('should apply danger variant classes', () => {
    render(<Button label="Delete" variant="danger" />);
    
    const button = screen.getByRole('button', { name: /delete/i });
    
    expect(button).toHaveClass('bg-red-500');
  });

  /**
   * TEST 6: Disabled Styling
   */
  test('should show opacity when disabled', () => {
    render(<Button label="Disabled" disabled={true} />);
    
    const button = screen.getByRole('button', { name: /disabled/i });
    
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  });

  /**
   * TEST 7: Multiple Clicks
   */
  test('should handle multiple clicks', () => {
    const handleClick = vi.fn();
    
    render(<Button label="Counter" onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /counter/i });
    
    // Click 3 times
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });
});

/**
 * HOW TO RUN THESE TESTS:
 * 
 * 1. Run all tests:
 *    npm test
 * 
 * 2. Run in watch mode (auto-rerun on changes):
 *    npm run test:watch
 * 
 * 3. Run with UI (visual interface):
 *    npm run test:ui
 * 
 * 4. Run with coverage:
 *    npm run test:coverage
 * 
 * EXPECTED OUTPUT:
 * ✓ should render button with correct label
 * ✓ should call onClick handler when clicked
 * ✓ should not call onClick when button is disabled
 * ... etc
 */
