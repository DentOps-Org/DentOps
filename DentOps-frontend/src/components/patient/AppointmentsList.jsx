import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAppointments, updateAppointment } from '../../redux/slices/appointmentSlice';

const AppointmentsList = () => {
  const dispatch = useDispatch();
  const { appointments, isLoading, error } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);
  
  const [filter, setFilter] = useState({ 
    status: '', 
    startDate: '', 
    endDate: '' 
  });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });
  
  useEffect(() => {
    if (user) {
      dispatch(getAppointments({ 
        patientId: user._id || user.id, 
        ...filter 
      }));
    }
  }, [dispatch, user, filter]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      startTime: new Date(appointment.startTime).toISOString().slice(0, 16),
      endTime: new Date(appointment.endTime).toISOString().slice(0, 16),
      notes: appointment.notes || ''
    });
    setShowEditForm(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    dispatch(updateAppointment({ 
      id: editingAppointment._id, 
      appointmentData: formData 
    }));
    
    setShowEditForm(false);
    setEditingAppointment(null);
    setFormData({
      startTime: '',
      endTime: '',
      notes: ''
    });
  };
  
  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      dispatch(updateAppointment({ 
        id, 
        appointmentData: { status: 'CANCELLED' } 
      }));
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const isUpcoming = (appointment) => {
    return new Date(appointment.startTime) > new Date();
  };
  
  const canEdit = (appointment) => {
    return isUpcoming(appointment) && appointment.status === 'CONFIRMED';
  };
  
  const canCancel = (appointment) => {
    return isUpcoming(appointment) && ['CONFIRMED', 'PENDING'].includes(appointment.status);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-700">My Appointments</h1>
        <Link 
          to="/book-appointment" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Book New Appointment
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filter.startDate}
              onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filter.endDate}
              onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: '', startDate: '', endDate: '' })}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Reschedule Appointment</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Start Time*</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">End Time*</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAppointment(null);
                  setFormData({
                    startTime: '',
                    endTime: '',
                    notes: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Reschedule Appointment
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Appointments</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">Loading appointments...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : appointments?.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.reason || 'Dental Appointment'}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {isUpcoming(appointment) && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Provider:</span> {appointment.providerId?.fullName || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Specialization:</span> {appointment.providerId?.specialization || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date & Time:</span> {formatDate(appointment.startTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Duration:</span> {Math.round((new Date(appointment.endTime) - new Date(appointment.startTime)) / (1000 * 60))} minutes
                        </p>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    {canEdit(appointment) && (
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        Reschedule
                      </button>
                    )}
                    {canCancel(appointment) && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No appointments found. Book your first appointment today!
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;
