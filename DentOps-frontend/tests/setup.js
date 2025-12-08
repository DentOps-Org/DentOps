/**
 * TEST SETUP FILE
 * 
 * This file runs BEFORE all tests.
 * It sets up Testing Library matchers and any global test utilities.
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Add Testing Library matchers to Vitest
// This gives us matchers like: toBeInTheDocument(), toHaveClass(), etc.
expect.extend(matchers);

// Cleanup after each test
// This removes rendered components from the DOM
afterEach(() => {
  cleanup();
});
