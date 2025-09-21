import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const DentistAvailability = () => {
  const { user } = useSelector((state) => state.auth);
  const [availability, setAvailability] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    bufferTime: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  useEffect(() => {
    if (user?._id) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/availability/dentist/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAvailability(result.data || []);
      } else {
        setError('Failed to fetch availability');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'dayOfWeek' || name === 'slotDuration' || name === 'bufferTime' 
        ? parseInt(value) 
        : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dentistId: user._id,
          ...formData
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setAvailability([...availability, result.data]);
        setFormData({
          dayOfWeek: 0,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          bufferTime: 10
        });
        setShowAddForm(false);
        alert('Availability added successfully!');
      } else {
        alert(`Error: ${result.message || 'Failed to add availability'}`);
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Failed to add availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/availability/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAvailability(availability.filter(item => item._id !== id));
        alert('Availability deleted successfully!');
      } else {
        setError('Failed to delete availability');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      setError('Failed to delete availability');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/availability/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        setAvailability(availability.map(item => 
          item._id === id ? { ...item, isActive: !isActive } : item
        ));
      } else {
        setError('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      setError('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can manage availability
  if (user?.role !== 'DENTAL_STAFF') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only Dental Staff can manage availability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">My Availability</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Add Availability Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
        >
          + Add Availability
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Add Availability</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Day of Week *</label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Slot Duration (minutes)</label>
                <select
                  name="slotDuration"
                  value={formData.slotDuration}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Buffer Time (minutes)</label>
                <select
                  name="bufferTime"
                  value={formData.bufferTime}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>No buffer</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Availability'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Availability List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Current Availability</h3>
        </div>
        
        {loading && !showAddForm ? (
          <div className="p-6 text-center">Loading availability...</div>
        ) : availability.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No availability set. Add your working hours to allow patients to book appointments.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {availability.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        {daysOfWeek[item.dayOfWeek]}
                      </div>
                      <div className="text-gray-600">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.slotDuration}min slots, {item.bufferTime}min buffer
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        item.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">How Availability Works</h4>
        <ul className="text-blue-700 space-y-1">
          <li>• Set your working hours for each day of the week</li>
          <li>• The system will automatically generate bookable time slots</li>
          <li>• Buffer time prevents back-to-back appointments</li>
          <li>• Patients can only book during your active availability</li>
          <li>• You can temporarily deactivate availability without deleting it</li>
        </ul>
      </div>
    </div>
  );
};

export default DentistAvailability;
