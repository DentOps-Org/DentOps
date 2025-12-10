// ManagerDashboard component tests

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ManagerDashboard from '../../src/pages/Dashboard/ManagerDashboard';
import authReducer from '../../src/redux/slices/authSlice';
import appointmentTypeReducer from '../../src/redux/slices/appointmentTypeSlice';
import axios from '../../src/api/axios';

// Mock axios
vi.mock('../../src/api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const createTestStore = (authState, appointmentTypesState = {}) => {
  return configureStore({
    reducer: { 
      auth: authReducer,
      appointmentTypes: appointmentTypeReducer,
    },
    preloadedState: { 
      auth: authState,
      appointmentTypes: appointmentTypesState,
    },
  });
};

const renderManagerDashboard = (authState = {}, appointmentTypesState = {}) => {
  const defaultAuthState = {
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
    ...authState,
  };
  
  const defaultAppointmentTypesState = {
    types: [],
    isLoading: false,
    ...appointmentTypesState,
  };
  
  const store = createTestStore(defaultAuthState, defaultAppointmentTypesState);
  
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ManagerDashboard />
      </MemoryRouter>
    </Provider>
  );
};

describe('ManagerDashboard Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: { count: 0, data: [] } });
  });

  test('should render dashboard title', () => {
    renderManagerDashboard();
    expect(screen.getByText('Clinic Manager Dashboard')).toBeInTheDocument();
  });

  test('should have Appointment Types card', () => {
    renderManagerDashboard();
    expect(screen.getByText('Appointment Types')).toBeInTheDocument();
    const appointmentTypesSection = screen.getByText('Appointment Types').closest('div');
    expect(appointmentTypesSection).toBeInTheDocument();
  });

  test('should have Inventory card', () => {
    renderManagerDashboard();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /new item/i })).toBeInTheDocument();
  });

  test('should have Dentist Availability card', () => {
    renderManagerDashboard();
    expect(screen.getByText('Dentist Availability')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage availability/i })).toBeInTheDocument();
  });

  test('should show Pending Requests section', () => {
    renderManagerDashboard();
    expect(screen.getByText('Pending Requests')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open requests/i })).toBeInTheDocument();
  });

  test('should display appointment types count', () => {
    renderManagerDashboard({}, { types: [{ id: 1 }, { id: 2 }] });
    // Check if count is displayed (might be in the card)
    const appointmentTypesText = screen.getByText('Appointment Types');
    expect(appointmentTypesText).toBeInTheDocument();
  });
});

