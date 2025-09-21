import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AppointmentManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentTypeId: '',
    startTime: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (user?._id) {
      fetchAppointments();
      fetchAppointmentTypes();
    }
  }, [user, selectedDate, viewMode]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `http://localhost:5000/appointments?providerId=${user._id}`;
      
      if (viewMode === 'day') {
        url += `&startDate=${selectedDate}&endDate=${selectedDate}`;
      } else if (viewMode === 'week') {
        const startOfWeek = new Date(selectedDate);
        const endOfWeek = new Date(selectedDate);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        url += `&startDate=${startOfWeek.toISOString().split('T')[0]}&endDate=${endOfWeek.toISOString().split('T')[0]}`;
      }
      
      console.log('Fetching appointments from URL:', url);
      console.log('Selected date:', selectedDate, 'View mode:', viewMode);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Appointments fetched:', result.data);
        setAppointments(result.data || []);
      } else {
        const errorResult = await response.json();
        console.error('Failed to fetch appointments:', errorResult);
        setError('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/appointment-types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Filter to show only active appointment types for appointment creation
        const activeTypes = (result.data || []).filter(type => type.isActive);
        setAppointmentTypes(activeTypes);
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        ));
        alert(`Appointment ${newStatus.toLowerCase()} successfully!`);
      } else {
        const result = await response.json();
        alert(`Error: ${result.message || 'Failed to update appointment'}`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.appointmentTypeId || !formData.startTime || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          providerId: user._id
        })
      });

      const result = await response.json();

      if (response.ok) {
        setAppointments([result.data, ...appointments]);
        setFormData({
          patientId: '',
          appointmentTypeId: '',
          startTime: '',
          reason: '',
          notes: ''
        });
        setShowCreateForm(false);
        alert('Appointment created successfully!');
      } else {
        alert(`Error: ${result.message || 'Failed to create appointment'}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusActions = (appointment) => {
    const actions = [];
    
    if (appointment.status === 'PENDING') {
      actions.push(
        <button
          key="confirm"
          onClick={() => handleStatusChange(appointment._id, 'CONFIRMED')}
          className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
        >
          Confirm
        </button>
      );
    }
    
    if (appointment.status === 'CONFIRMED') {
      actions.push(
        <button
          key="complete"
          onClick={() => handleStatusChange(appointment._id, 'COMPLETED')}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
        >
          Complete
        </button>
      );
    }
    
    if (appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED') {
      actions.push(
        <button
          key="cancel"
          onClick={() => handleStatusChange(appointment._id, 'CANCELLED')}
          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
        >
          Cancel
        </button>
      );
    }
    
    if (appointment.status === 'CONFIRMED') {
      actions.push(
        <button
          key="no-show"
          onClick={() => handleStatusChange(appointment._id, 'NO_SHOW')}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
        >
          No Show
        </button>
      );
    }
    
    return actions;
  };

  // Check if user can manage appointments
  if (user?.role !== 'DENTAL_STAFF') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only Dental Staff can manage appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Appointment Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Day View</option>
                <option value="week">Week View</option>
                <option value="month">Month View</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            + Create Appointment
          </button>
        </div>
      </div>

      {/* Create Appointment Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create New Appointment</h2>
          
          <form onSubmit={handleCreateAppointment}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Patient Email *</label>
                <input
                  type="email"
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Appointment Type *</label>
                <select
                  value={formData.appointmentTypeId}
                  onChange={(e) => setFormData({...formData, appointmentTypeId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select appointment type</option>
                  {appointmentTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name} ({type.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Reason *</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Regular checkup, Tooth pain"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 mb-2 font-medium">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Appointments ({appointments.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No appointments found for the selected period.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(appointment.startTime)}
                      </span>
                      <span className="text-sm font-medium">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">
                      Patient: {appointment.patientId?.fullName || 'Unknown'}
                    </h4>
                    <p className="text-gray-600 mb-1">
                      Reason: {appointment.reason}
                    </p>
                    {appointment.notes && (
                      <p className="text-gray-600 text-sm">
                        Notes: {appointment.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusActions(appointment)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;