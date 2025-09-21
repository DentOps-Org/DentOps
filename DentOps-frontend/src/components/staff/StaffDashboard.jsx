import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProviderCalendar } from '../../redux/slices/appointmentSlice';
import { getLowStockItems } from '../../redux/slices/inventorySlice';

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { providerCalendar, isLoading: calendarLoading } = useSelector((state) => state.appointments);
  const { lowStockItems, isLoading: inventoryLoading } = useSelector((state) => state.inventory);
  
  useEffect(() => {
    if (user) {
      dispatch(getProviderCalendar({ providerId: user._id || user.id, range: 'day' }));
      dispatch(getLowStockItems());
    }
  }, [dispatch, user]);
  
  // Format date for display
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
  
  // Format time only
  const formatTime = (dateString) => {
    const options = { 
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Get today's appointments
  const todayAppointments = providerCalendar?.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    const today = new Date();
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  }) || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-700">Staff Dashboard</h1>
      
      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-2">Welcome, Dr. {user?.fullName}</h2>
        <p className="text-gray-600">Manage your appointments, patients, and clinic inventory</p>
      </div>
      
      {/* Quick actions section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link 
          to="/inventory" 
          className="bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg p-6 flex flex-col items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-xl font-semibold">Manage Inventory</span>
        </Link>
        
        <Link 
          to="/patients" 
          className="bg-gray-700 hover:bg-gray-800 text-white rounded-lg p-6 flex flex-col items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xl font-semibold">Patient Records</span>
        </Link>
      </div>
      
      {/* Today's appointments section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Today's Schedule</h2>
        </div>
        
        {calendarLoading ? (
          <p className="text-gray-600">Loading schedule...</p>
        ) : todayAppointments.length > 0 ? (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment._id} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{appointment.patientId?.fullName || 'Patient'}</p>
                    <p className="text-gray-600">{appointment.reason || 'Dental Appointment'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
                    <p className="text-sm text-gray-500">
                      Status: <span className={`font-medium ${appointment.status === 'CONFIRMED' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {appointment.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link 
                    to={`/appointments/${appointment._id}`} 
                    className="text-primary-600 hover:text-primary-800 text-sm mr-4"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/patients/${appointment.patientId?._id}/records`} 
                    className="text-secondary-600 hover:text-secondary-800 text-sm"
                  >
                    Patient Records
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No appointments scheduled for today.</p>
        )}
      </div>
      
      {/* Low stock inventory section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Low Stock Inventory</h2>
          <Link to="/inventory" className="text-primary-600 hover:text-primary-800">View All</Link>
        </div>
        
        {inventoryLoading ? (
          <p className="text-gray-600">Loading inventory...</p>
        ) : lowStockItems?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockItems.slice(0, 5).map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.reorderThreshold} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.quantity === 0 ? 
                          'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No low stock items at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
