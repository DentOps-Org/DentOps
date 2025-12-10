// DentistDashboard component tests

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import DentistDashboard from '../../src/pages/Dashboard/DentistDashboard';
import authReducer from '../../src/redux/slices/authSlice';
import axios from '../../src/api/axios';

// Mock axios
vi.mock('../../src/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const createTestStore = (authState) => {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });
};

const renderDentistDashboard = (authState = {}) => {
  const defaultState = {
    user: { 
      id: '1', 
      _id: '1',
      email: 'dentist@example.com', 
      role: 'DENTAL_STAFF',
      specialization: 'DENTIST'
    },
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
        <DentistDashboard />
      </MemoryRouter>
    </Provider>
  );
};

describe('DentistDashboard Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock axios.get to return empty appointments by default
    axios.get.mockResolvedValue({ data: [] });
  });

  test('should render dashboard title', () => {
    renderDentistDashboard();
    expect(screen.getByText('Dentist Dashboard')).toBeInTheDocument();
  });

  test('should show description text', () => {
    renderDentistDashboard();
    expect(screen.getByText(/Manage your schedule and patient records/i)).toBeInTheDocument();
  });

  test('should have quick action links', () => {
    renderDentistDashboard();
    expect(screen.getByRole('link', { name: /view appointment types/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /my timings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /patient records/i })).toBeInTheDocument();
  });

  test('should have tabs for upcoming and completed appointments', () => {
    renderDentistDashboard();
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  test('should show loading message when loading', async () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderDentistDashboard();
    
    // Wait a bit for loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByText(/loading appointments/i)).toBeInTheDocument();
  });
});

