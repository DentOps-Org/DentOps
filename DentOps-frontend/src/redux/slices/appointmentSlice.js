import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService } from '../../services/api';

const initialState = {
  appointments: [],
  appointment: null,
  availableSlots: [],
  providerCalendar: [],
  isLoading: false,
  error: null,
};

// Get appointments with optional filters
export const getAppointments = createAsyncThunk(
  'appointments/getAppointments',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointments(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

// Get single appointment
export const getAppointment = createAsyncThunk(
  'appointments/getAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }
);

// Create new appointment
export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

// Update appointment
export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointmentData }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.updateAppointment(id, appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

// Delete appointment
export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id, { rejectWithValue }) => {
    try {
      await appointmentService.deleteAppointment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete appointment');
    }
  }
);

// Get available slots
export const getAvailableSlots = createAsyncThunk(
  'appointments/getAvailableSlots',
  async ({ providerId, date }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAvailableSlots(providerId, date);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available slots');
    }
  }
);

// Get provider calendar
export const getProviderCalendar = createAsyncThunk(
  'appointments/getProviderCalendar',
  async ({ providerId, range }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getProviderCalendar(providerId, range);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch provider calendar');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointment: (state) => {
      state.appointment = null;
    },
    clearAppointmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get appointments
      .addCase(getAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get single appointment
      .addCase(getAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointment = action.payload;
      })
      .addCase(getAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.appointments.findIndex(app => app._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        state.appointment = action.payload;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = state.appointments.filter(app => app._id !== action.payload);
        if (state.appointment && state.appointment._id === action.payload) {
          state.appointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get available slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get provider calendar
      .addCase(getProviderCalendar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProviderCalendar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providerCalendar = action.payload;
      })
      .addCase(getProviderCalendar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAppointment, clearAppointmentError } = appointmentSlice.actions;

export default appointmentSlice.reducer;
