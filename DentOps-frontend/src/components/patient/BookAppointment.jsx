import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [formData, setFormData] = useState({
    appointmentTypeId: '',
    requestedDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch appointment types on component mount
  useEffect(() => {
    fetchAppointmentTypes();
  }, []);


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
        console.log('Appointment types fetched:', result.data);
        // Filter to show only active appointment types for patient booking
        const activeTypes = (result.data || []).filter(type => type.isActive);
        setAppointmentTypes(activeTypes);
      } else {
        const errorResult = await response.json();
        console.error('Failed to fetch appointment types:', errorResult);
        setError('Failed to fetch appointment types');
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error);
      setError('Failed to fetch appointment types');
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentTypeId || !formData.requestedDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const appointmentData = {
        appointmentTypeId: formData.appointmentTypeId,
        requestedDate: formData.requestedDate,
        notes: formData.notes
      };
      
      const response = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Appointment request submitted successfully! Our staff will contact you to confirm the appointment.');
        navigate('/appointments');
      } else {
        alert(`Error: ${result.message || 'Failed to submit appointment request'}`);
      }
    } catch (error) {
      console.error('Error submitting appointment request:', error);
      alert('Failed to submit appointment request');
    } finally {
      setLoading(false);
    }
  };


  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return <div className="text-center p-4">Loading appointment types...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Request Appointment</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How it works:</h3>
          <p className="text-blue-700">
            1. Select your preferred appointment type and date<br/>
            2. Submit your request<br/>
            3. Our staff will contact you to confirm the appointment time
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Appointment Type *</label>
              <select
                name="appointmentTypeId"
                value={formData.appointmentTypeId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose appointment type</option>
                {appointmentTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Preferred Date *</label>
              <input
                type="date"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                min={getMinDate()}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 mb-2 font-medium">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.appointmentTypeId || !formData.requestedDate}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;