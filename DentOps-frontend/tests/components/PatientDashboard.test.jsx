// PatientDashboard component tests

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import PatientDashboard from '../../src/pages/Dashboard/PatientDashboard';
import authReducer from '../../src/redux/slices/authSlice';

const createTestStore = (authState) => {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });
};

const renderPatientDashboard = (authState = {}) => {
  const defaultState = {
    user: { id: '1', email: 'patient@example.com', role: 'PATIENT' },
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    ...authState,
  };
  
  const store = createTestStore(defaultState);
  
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PatientDashboard />
      </MemoryRouter>
    </Provider>
  );
};

describe('PatientDashboard Component', () => {
  
  test('should render dashboard title', () => {
    renderPatientDashboard();
    expect(screen.getByText('Patient Dashboard')).toBeInTheDocument();
  });

  test('should show description text', () => {
    renderPatientDashboard();
    expect(screen.getByText(/Request appointments and view your records/i)).toBeInTheDocument();
  });

  test('should have Request Appointment card with link', () => {
    renderPatientDashboard();
    expect(screen.getByText('Request Appointment')).toBeInTheDocument();
    const requestLink = screen.getByRole('link', { name: /request/i });
    expect(requestLink).toBeInTheDocument();
    expect(requestLink.getAttribute('href')).toBe('/appointments/new');
  });

  test('should have My Appointments card with link', () => {
    renderPatientDashboard();
    expect(screen.getByText('My Appointments')).toBeInTheDocument();
    const appointmentsLink = screen.getByRole('link', { name: /view all/i });
    expect(appointmentsLink).toBeInTheDocument();
    expect(appointmentsLink.getAttribute('href')).toBe('/appointments/my');
  });

  test('should have My Records card with link', () => {
    renderPatientDashboard();
    expect(screen.getByText('My Records')).toBeInTheDocument();
    const recordsLink = screen.getByRole('link', { name: /view records/i });
    expect(recordsLink).toBeInTheDocument();
    expect(recordsLink.getAttribute('href')).toBe('/records');
  });

  test('should have Quick Actions section', () => {
    renderPatientDashboard();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see services/i })).toBeInTheDocument();
  });
});

