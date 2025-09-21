import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AllDentistAvailability = () => {
  const { user } = useSelector((state) => state.auth);
  const [allAvailability, setAllAvailability] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  useEffect(() => {
    if (user?.role === 'DENTAL_STAFF' && user?.specialization === 'MANAGER') {
      fetchDentists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDentist) {
      fetchDentistAvailability(selectedDentist);
    }
  }, [selectedDentist]);

  const fetchDentists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const dentistUsers = result.data.filter(u => u.role === 'DENTAL_STAFF' && u.specialization === 'DENTIST');
        setDentists(dentistUsers);
        if (dentistUsers.length > 0) {
          setSelectedDentist(dentistUsers[0]._id);
        }
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to fetch dentists');
      }
    } catch (err) {
      console.error('Error fetching dentists:', err);
      setError('Failed to fetch dentists');
    } finally {
      setLoading(false);
    }
  };

  const fetchDentistAvailability = async (dentistId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/availability/${dentistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAllAvailability(result.data || []);
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to fetch availability');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDentistName = () => {
    const dentist = dentists.find(d => d._id === selectedDentist);
    return dentist ? dentist.fullName : 'Select Dentist';
  };

  if (user?.role !== 'DENTAL_STAFF' || user?.specialization !== 'MANAGER') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only Clinic Managers can view all dentist availability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">All Dentist Availability</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Dentist Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Select Dentist</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Choose Dentist</label>
          <select
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a dentist...</option>
            {dentists.map((dentist) => (
              <option key={dentist._id} value={dentist._id}>
                {dentist.fullName} ({dentist.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Availability Display */}
      {selectedDentist && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {getSelectedDentistName()}'s Availability
          </h2>
          
          {loading ? (
            <p className="text-gray-600">Loading availability...</p>
          ) : allAvailability.length === 0 ? (
            <p className="text-gray-600">No availability blocks set for this dentist.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Day</th>
                    <th className="py-2 px-4 border-b text-left">Time</th>
                    <th className="py-2 px-4 border-b text-left">Recurring</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allAvailability.map((avail) => (
                    <tr key={avail._id}>
                      <td className="py-2 px-4 border-b">{daysOfWeek.find(d => d.value === avail.weekday)?.label}</td>
                      <td className="py-2 px-4 border-b">{avail.startTimeOfDay} - {avail.endTimeOfDay}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${avail.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {avail.isRecurring ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${avail.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {avail.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllDentistAvailability;
