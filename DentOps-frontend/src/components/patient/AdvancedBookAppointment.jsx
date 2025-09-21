import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AdvancedBookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [providers, setProviders] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    providerId: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch available slots when provider and date are selected
  useEffect(() => {
    if (formData.providerId && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.providerId, formData.date]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching providers...');
      
      const response = await fetch('http://localhost:5000/api/users?role=DENTAL_STAFF', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Providers response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Providers result:', result);
        setProviders(result.data || []);
      } else {
        const result = await response.json();
        console.error('Error fetching providers:', result);
        setError('Failed to fetch providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setError('');
      const token = localStorage.getItem('token');
      console.log('Fetching slots for provider:', formData.providerId, 'date:', formData.date);
      
      const response = await fetch(
        `http://localhost:5000/api/availability/${formData.providerId}/slots?date=${formData.date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Available slots result:', result);
        setAvailableSlots(result.data || []);
      } else {
        const result = await response.json();
        console.error('Error response:', result);
        setError(result.message || 'Failed to fetch available slots');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset time when provider or date changes
    if (name === 'providerId' || name === 'date') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        time: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.providerId || !formData.date || !formData.time || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Find the selected slot from available slots
      const selectedSlot = availableSlots.find(slot => 
        new Date(slot.startTime).toTimeString().slice(0, 5) === formData.time
      );
      
      if (!selectedSlot) {
        alert('Selected time slot is no longer available');
        return;
      }
      
      const appointmentData = {
        providerId: formData.providerId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: formData.reason,
        notes: formData.notes
      };
      
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Appointment booked successfully!');
        navigate('/appointments');
      } else {
        alert(`Error: ${result.message || 'Failed to book appointment'}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toTimeString().slice(0, 5);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">Book an Appointment</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Select Provider *
              </label>
              {loading ? (
                <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                  Loading providers...
                </div>
              ) : (
                <select
                  name="providerId"
                  value={formData.providerId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a provider...</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.fullName} - {provider.specialization || 'Dental Staff'}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Select Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.providerId}
              />
            </div>
            
            {/* Time Selection */}
            {formData.providerId && formData.date && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">
                  Select Time *
                </label>
                {loadingSlots ? (
                  <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                    Loading available slots...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: formatTime(slot.startTime) }))}
                        className={`p-3 border rounded-md text-center ${
                          formData.time === formatTime(slot.startTime)
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    No available slots for the selected date.
                  </div>
                )}
              </div>
            )}
            
            {/* Reason Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Reason for Visit *
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a reason...</option>
                <option value="CHECKUP">Regular Checkup</option>
                <option value="CLEANING">Cleaning</option>
                <option value="FILLING">Filling</option>
                <option value="ROOT_CANAL">Root Canal</option>
                <option value="EXTRACTION">Extraction</option>
                <option value="CROWN">Crown</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information..."
              ></textarea>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.time}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvancedBookAppointment;
