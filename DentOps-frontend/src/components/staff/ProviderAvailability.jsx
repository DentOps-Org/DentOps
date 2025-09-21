import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ProviderAvailability = () => {
  const { user } = useSelector((state) => state.auth);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [formData, setFormData] = useState({
    weekday: '',
    startTimeOfDay: '09:00',
    endTimeOfDay: '17:00',
    isRecurring: true,
    isActive: true,
  });

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
    if (user?._id) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/availability/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Availability fetched:', result.data);
        setAvailability(result.data);
      } else {
        const err = await response.json();
        console.error('Failed to fetch availability:', err);
        setError(err.message || 'Failed to fetch availability');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const method = editingAvailability ? 'PUT' : 'POST';
      const url = editingAvailability 
        ? `http://localhost:5000/availability/${editingAvailability._id}`
        : `http://localhost:5000/availability`;

      const payload = {
        ...formData,
        weekday: parseInt(formData.weekday),
        dentalStaffId: user._id
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchAvailability();
        resetForm();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to save availability');
      }
    } catch (err) {
      console.error('Error saving availability:', err);
      setError('Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (avail) => {
    setEditingAvailability(avail);
    setFormData({
      weekday: avail.weekday,
      startTimeOfDay: avail.startTimeOfDay,
      endTimeOfDay: avail.endTimeOfDay,
      isRecurring: avail.isRecurring,
      isActive: avail.isActive,
    });
    setShowAddForm(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/availability/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (response.ok) {
        await fetchAvailability();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to update availability status');
      }
    } catch (err) {
      console.error('Error updating availability status:', err);
      setError('Failed to update availability status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability block?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/availability/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchAvailability();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to delete availability');
      }
    } catch (err) {
      console.error('Error deleting availability:', err);
      setError('Failed to delete availability');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingAvailability(null);
    setShowAddForm(false);
    setFormData({
      weekday: '',
      startTimeOfDay: '09:00',
      endTimeOfDay: '17:00',
      isRecurring: true,
      isActive: true,
    });
  };

  if (loading && !showAddForm) return <div className="text-center p-4">Loading availability...</div>;
  if (error && !showAddForm) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">My Availability</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Add Availability
        </button>
      </div>

      {error && showAddForm && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{editingAvailability ? 'Edit Availability' : 'Add New Availability Block'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Day of Week</label>
                <select
                  name="weekday"
                  value={formData.weekday}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Start Time</label>
                <input type="time" name="startTimeOfDay" value={formData.startTimeOfDay} onChange={handleChange} className="w-full p-2 border rounded-md" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">End Time</label>
                <input type="time" name="endTimeOfDay" value={formData.endTimeOfDay} onChange={handleChange} className="w-full p-2 border rounded-md" required />
              </div>
              <div className="mb-4 flex items-center">
                <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} className="mr-2" />
                <label className="text-gray-700">Recurring</label>
              </div>
              <div className="mb-4 flex items-center">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="mr-2" />
                <label className="text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md">
                Cancel
              </button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium" disabled={loading}>
                {editingAvailability ? 'Update Availability' : 'Add Availability'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">My Current Availability</h2>
        {availability.length === 0 ? (
          <p className="text-gray-600">No availability blocks set. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Day</th>
                  <th className="py-2 px-4 border-b text-left">Time</th>
                  <th className="py-2 px-4 border-b text-left">Recurring</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {availability.map((avail) => (
                  <tr key={avail._id}>
                    <td className="py-2 px-4 border-b">{daysOfWeek.find(d => d.value === avail.weekday)?.label}</td>
                    <td className="py-2 px-4 border-b">{avail.startTimeOfDay} - {avail.endTimeOfDay}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${avail.isRecurring ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {avail.isRecurring ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleToggleStatus(avail._id, avail.isActive)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          avail.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        disabled={loading}
                      >
                        {avail.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleEdit(avail)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(avail._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderAvailability;
