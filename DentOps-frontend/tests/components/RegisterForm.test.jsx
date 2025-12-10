// RegisterForm component tests

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import RegisterForm from '../../src/components/RegisterForm';
import authReducer from '../../src/redux/slices/authSlice';

const mockAlert = vi.fn();
window.alert = mockAlert;

const createTestStore = (authState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: authState,
    },
  });
};

const renderRegisterForm = (authState = {}) => {
  const defaultState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    ...authState,
  };
  
  const store = createTestStore(defaultState);
  
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    </Provider>
  );
};

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render all form fields', () => {
    renderRegisterForm();
    
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('should default role to PATIENT', () => {
    renderRegisterForm();
    
    const roleSelect = screen.getByDisplayValue(/patient/i);
    expect(roleSelect).toBeInTheDocument();
  });

  test('should not show specialization field when role is PATIENT', () => {
    renderRegisterForm();
    expect(screen.queryByText(/select specialization/i)).not.toBeInTheDocument();
  });

  test('should show specialization field when role is DENTAL_STAFF', () => {
    renderRegisterForm();
    
    const roleSelect = screen.getByDisplayValue(/patient/i);
    fireEvent.change(roleSelect, { target: { value: 'DENTAL_STAFF' } });
    
    expect(screen.getByText(/select specialization/i)).toBeInTheDocument();
  });

  test('should update all form fields when user types', () => {
    renderRegisterForm();
    
    const fullNameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const phoneInput = screen.getByPlaceholderText(/phone number/i);
    const passwordInput = screen.getByPlaceholderText(/^password$/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
    
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(fullNameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(phoneInput.value).toBe('1234567890');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('should have a link to login page', () => {
    renderRegisterForm();
    
    const loginLink = screen.getByRole('link', { name: /login here/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  test('should show DENTIST and CLINIC_MANAGER options when role is DENTAL_STAFF', () => {
    renderRegisterForm();
    
    const roleSelect = screen.getByDisplayValue(/patient/i);
    fireEvent.change(roleSelect, { target: { value: 'DENTAL_STAFF' } });
    
    expect(screen.getByText(/dentist/i)).toBeInTheDocument();
    expect(screen.getByText(/clinic manager/i)).toBeInTheDocument();
  });
});

