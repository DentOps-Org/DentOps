import axios from 'axios';

// Create axios instance with base URL
// Use environment variable for API URL
// In development: http://localhost:5000
// In production: https://dentops-api.onrender.com
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};

// Appointment services
export const appointmentService = {
  getAppointments: async (filters = {}) => {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },
  
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },
  
  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
  
  confirmAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}/confirm`, appointmentData);
    return response.data;
  },
  
  cancelAppointment: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },
  
  completeAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/complete`);
    return response.data;
  },
  
  markNoShow: async (id) => {
    const response = await api.put(`/appointments/${id}/no-show`);
    return response.data;
  },
  
  getAvailableSlots: async (dentalStaffId, date, slotDuration = 30, bufferAfter = 10) => {
    const response = await api.get(`/appointments/available`, { 
      params: { providerId: dentalStaffId, date, slotDuration, bufferAfter } 
    });
    return response.data;
  },
  
  getProviderCalendar: async (dentalStaffId, range = 'day') => {
    const response = await api.get(`/appointments/provider/${dentalStaffId}`, {
      params: { range }
    });
    return response.data;
  }
};

// Inventory services
export const inventoryService = {
  getInventoryItems: async (filters = {}) => {
    const response = await api.get('/inventory', { params: filters });
    return response.data;
  },
  
  getInventoryItem: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },
  
  createInventoryItem: async (itemData) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  },
  
  updateInventoryItem: async (id, itemData) => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },
  
  deleteInventoryItem: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },
  
  adjustInventoryQuantity: async (id, delta) => {
    const response = await api.put(`/inventory/${id}/adjust`, { delta });
    return response.data;
  },
  
  getLowStockItems: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  }
};

// Patient Record services
export const recordService = {
  getRecords: async (filters = {}) => {
    const response = await api.get('/records', { params: filters });
    return response.data;
  },
  
  getRecord: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },
  
  createRecord: async (recordData) => {
    // For file uploads, we need to use FormData
    const formData = new FormData();
    
    // Add all fields to formData
    Object.keys(recordData).forEach(key => {
      if (key === 'file') {
        formData.append('file', recordData.file);
      } else {
        formData.append(key, recordData[key]);
      }
    });
    
    const response = await api.post('/records', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  updateRecord: async (id, recordData) => {
    const response = await api.put(`/records/${id}`, recordData);
    return response.data;
  },
  
  deleteRecord: async (id) => {
    const response = await api.delete(`/records/${id}`);
    return response.data;
  },
  
  archiveRecord: async (id) => {
    const response = await api.put(`/records/${id}/archive`);
    return response.data;
  },
  
  getDownloadUrl: (id) => {
    return `${API_URL}/records/${id}/download`;
  }
};

// Availability services
export const availabilityService = {
  getAvailability: async (dentalStaffId, date = null) => {
    const params = date ? { date } : {};
    const response = await api.get(`/availability/${dentalStaffId}`, { params });
    return response.data;
  },
  
  createAvailability: async (availabilityData) => {
    const response = await api.post('/availability', availabilityData);
    return response.data;
  },
  
  updateAvailability: async (id, availabilityData) => {
    const response = await api.put(`/availability/${id}`, availabilityData);
    return response.data;
  },
  
  deleteAvailability: async (id) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
  },
  
  getFreeWindows: async (dentalStaffId, date, appointmentTypeId = null, durationMinutes = null, slotIntervalMinutes = 30, bufferAfter = 10) => {
    const params = { date, slotIntervalMinutes, bufferAfter };
    if (appointmentTypeId) params.appointmentTypeId = appointmentTypeId;
    if (durationMinutes) params.durationMinutes = durationMinutes;
    
    const response = await api.get(`/availability/${dentalStaffId}/free-windows`, { params });
    return response.data;
  }
};

// User services
export const userService = {
  getUsers: async (filters = {}) => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default api;
