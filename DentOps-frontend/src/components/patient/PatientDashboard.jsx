import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAppointments } from '../../redux/slices/appointmentSlice';
import { getRecords } from '../../redux/slices/recordSlice';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, isLoading: appointmentsLoading } = useSelector((state) => state.appointments);
  const { records, isLoading: recordsLoading } = useSelector((state) => state.records);

  useEffect(() => {
    if (user) {
      dispatch(getAppointments({ patientId: user._id || user.id }));
      dispatch(getRecords({ patientId: user._id || user.id }));
    }
  }, [dispatch, user]);

  // Filter upcoming appointments
  const upcomingAppointments = appointments?.filter(
    (appointment) => new Date(appointment.startTime) > new Date()
  ) || [];

  // Filter past appointments
  const pastAppointments = appointments?.filter(
    (appointment) => new Date(appointment.startTime) <= new Date()
  ) || [];

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-700">Patient Dashboard</h1>
      
      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-2">Welcome, {user?.fullName}</h2>
        <p className="text-gray-600">Manage your dental appointments and records</p>
      </div>
      
      {/* Actions section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link 
          to="/book-appointment" 
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-6 flex flex-col items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xl font-semibold">Request New Appointment</span>
        </Link>
        
        <Link 
          to="/patient-records" 
          className="bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg p-6 flex flex-col items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xl font-semibold">View Medical Records</span>
        </Link>
      </div>
      
      {/* Upcoming appointments section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Upcoming Appointments</h2>
          <Link to="/appointments" className="text-primary-600 hover:text-primary-800">View All</Link>
        </div>
        
        {appointmentsLoading ? (
          <p className="text-gray-600">Loading appointments...</p>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <div key={appointment._id} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{appointment.reason || 'Dental Appointment'}</p>
                    <p className="text-gray-600">Dr. {appointment.providerId?.fullName || 'Provider'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDate(appointment.startTime)}</p>
                    <p className="text-sm text-gray-500">
                      Status: <span className="font-medium">{appointment.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No upcoming appointments. Book your next visit today!</p>
        )}
      </div>
      
      {/* Recent records section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Medical Records</h2>
          <Link to="/patient-records" className="text-primary-600 hover:text-primary-800">View All</Link>
        </div>
        
        {recordsLoading ? (
          <p className="text-gray-600">Loading records...</p>
        ) : records?.length > 0 ? (
          <div className="space-y-4">
            {records.slice(0, 3).map((record) => (
              <div key={record._id} className="border-l-4 border-secondary-500 pl-4 py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{record.title || record.type}</p>
                    <p className="text-gray-600">
                      {record.description ? 
                        (record.description.length > 50 ? 
                          `${record.description.substring(0, 50)}...` : 
                          record.description) : 
                        'No description'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDate(record.uploadedAt)}</p>
                    <Link 
                      to={`/patient-records/${record._id}`} 
                      className="text-sm text-secondary-600 hover:text-secondary-800"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No records available.</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
