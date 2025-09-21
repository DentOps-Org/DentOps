import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AppointmentTypeManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    durationMinutes: 30,
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (user?.role === 'DENTAL_STAFF') {
      fetchAppointmentTypes();
    }
  }, [user]);

  const fetchAppointmentTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/appointment-types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Appointment types fetched:', result.data);
        setAppointmentTypes(result.data || []);
      } else {
        const errorResult = await response.json();
        console.error('Failed to fetch appointment types:', errorResult);
        setError('Failed to fetch appointment types');
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error);
      setError('Failed to fetch appointment types');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'durationMinutes' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const method = editingType ? 'PUT' : 'POST';
      const url = editingType 
        ? `http://localhost:5000/appointment-types/${editingType._id}`
        : 'http://localhost:5000/appointment-types';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchAppointmentTypes();
        resetForm();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to save appointment type');
      }
    } catch (err) {
      console.error('Error saving appointment type:', err);
      setError('Failed to save appointment type');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      durationMinutes: type.durationMinutes,
      description: type.description || '',
      isActive: type.isActive
    });
    setShowAddForm(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/appointment-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (response.ok) {
        await fetchAppointmentTypes();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to update appointment type status');
      }
    } catch (err) {
      console.error('Error updating appointment type status:', err);
      setError('Failed to update appointment type status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment type?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/appointment-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchAppointmentTypes();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to delete appointment type');
      }
    } catch (err) {
      console.error('Error deleting appointment type:', err);
      setError('Failed to delete appointment type');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingType(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      durationMinutes: 30,
      description: '',
      isActive: true
    });
  };

  if (user?.role !== 'DENTAL_STAFF') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only Dental Staff can manage appointment types.</p>
        </div>
      </div>
    );
  }

  if (loading && !showAddForm) return <div className="text-center p-4">Loading appointment types...</div>;
  if (error && !showAddForm) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Appointment Types</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Add Appointment Type
        </button>
      </div>

      {error && showAddForm && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{editingType ? 'Edit Appointment Type' : 'Add New Appointment Type'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Checkup, Filling, Root Canal"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  min="15"
                  max="300"
                  required
                />
              </div>
              <div className="mb-4 col-span-full">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Optional description..."
                ></textarea>
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                disabled={loading}
              >
                {editingType ? 'Update Type' : 'Add Type'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Current Appointment Types</h2>
        {appointmentTypes.length === 0 ? (
          <p className="text-gray-600">No appointment types found. Add some to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Duration</th>
                  <th className="py-2 px-4 border-b text-left">Description</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointmentTypes.map((type) => (
                  <tr key={type._id}>
                    <td className="py-2 px-4 border-b font-medium">{type.name}</td>
                    <td className="py-2 px-4 border-b">{type.durationMinutes} minutes</td>
                    <td className="py-2 px-4 border-b">{type.description || '-'}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleToggleStatus(type._id, type.isActive)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          type.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        disabled={loading}
                      >
                        {type.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleEdit(type)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(type._id)}
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

export default AppointmentTypeManagement;
