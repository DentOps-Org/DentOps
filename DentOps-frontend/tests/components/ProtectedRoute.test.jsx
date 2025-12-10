// ProtectedRoute component tests - checking if content shows/hides based on auth and roles

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import authReducer from '../../src/redux/slices/authSlice';

const createTestStore = (authState) => {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });
};

const renderProtectedRoute = (authState, allowedRoles = []) => {
  const store = createTestStore(authState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProtectedRoute allowedRoles={allowedRoles}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute Component', () => {
  
  test('should show content for authenticated user with no role restriction', () => {
    const authState = {
      user: { id: '1', email: 'test@example.com', role: 'PATIENT' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    renderProtectedRoute(authState, []);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should show content for authenticated user with correct role', () => {
    const authState = {
      user: { id: '1', email: 'test@example.com', role: 'PATIENT' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    renderProtectedRoute(authState, ['PATIENT']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should not show content for authenticated user with wrong role', () => {
    const authState = {
      user: { id: '1', email: 'test@example.com', role: 'PATIENT' },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    renderProtectedRoute(authState, ['DENTAL_STAFF']);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('should show content for dentist with correct specialization', () => {
    const authState = {
      user: { 
        id: '1', 
        email: 'dentist@example.com', 
        role: 'DENTAL_STAFF',
        specialization: 'DENTIST'
      },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    const allowedRoles = [{ role: 'DENTAL_STAFF', specializations: ['DENTIST'] }];
    renderProtectedRoute(authState, allowedRoles);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should not show content for manager with wrong specialization', () => {
    const authState = {
      user: { 
        id: '1', 
        email: 'manager@example.com', 
        role: 'DENTAL_STAFF',
        specialization: 'CLINIC_MANAGER'
      },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    const allowedRoles = [{ role: 'DENTAL_STAFF', specializations: ['DENTIST'] }];
    renderProtectedRoute(authState, allowedRoles);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
