import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SimpleBookAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    appointmentTypeId: '',
    requestedDate: '',
    notes: ''
  });
  
  // Mock appointment types data
  const appointmentTypes = [
    { _id: '507f1f77bcf86cd799439011', name: 'Regular Checkup', durationMinutes: 30 },
    { _id: '507f1f77bcf86cd799439012', name: 'Cleaning', durationMinutes: 45 },
    { _id: '507f1f77bcf86cd799439013', name: 'Filling', durationMinutes: 60 },
    { _id: '507f1f77bcf86cd799439014', name: 'Root Canal', durationMinutes: 90 },
  ];
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentTypeId || !formData.requestedDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    const appointmentData = {
      appointmentTypeId: formData.appointmentTypeId,
      requestedDate: formData.requestedDate,
      notes: formData.notes
    };
    
    try {
      // Make direct API call
      const token = localStorage.getItem('token');
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
      alert('Failed to submit appointment request. Please try again.');
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">Request an Appointment</h1>
        
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
            {/* Appointment Type Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Appointment Type *
              </label>
              <select
                name="appointmentTypeId"
                value={formData.appointmentTypeId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose appointment type...</option>
                {appointmentTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Preferred Date *
              </label>
              <input
                type="date"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleBookAppointment;
