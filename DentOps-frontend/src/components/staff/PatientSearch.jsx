import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const PatientSearch = ({ onPatientSelect, selectedPatient }) => {
  const { user } = useSelector((state) => state.auth);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchPatient = async (e) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/users?email=${encodeURIComponent(searchEmail)}&role=PATIENT`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.data || []);
        
        if (result.data.length === 0) {
          setError('No patient found with this email address');
        }
      } else {
        setError('Failed to search for patient');
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      setError('Failed to search for patient');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    onPatientSelect(patient);
    setSearchResults([]);
    setSearchEmail('');
  };

  // Check if user can search patients
  if (user?.role !== 'DENTAL_STAFF') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Search Patient by Email</h3>
      
      <form onSubmit={searchPatient} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter patient email address"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Search Results:</h4>
          {searchResults.map((patient) => (
            <div
              key={patient._id}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                selectedPatient?._id === patient._id
                  ? 'bg-blue-100 border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handlePatientSelect(patient)}
            >
              <div className="font-medium text-gray-900">{patient.fullName}</div>
              <div className="text-sm text-gray-600">{patient.email}</div>
              {patient.phone && (
                <div className="text-sm text-gray-600">Phone: {patient.phone}</div>
              )}
              {patient.age && (
                <div className="text-sm text-gray-600">Age: {patient.age}</div>
              )}
              {patient.gender && (
                <div className="text-sm text-gray-600">Gender: {patient.gender}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800">Selected Patient:</h4>
          <div className="text-green-700">
            <div>{selectedPatient.fullName}</div>
            <div className="text-sm">{selectedPatient.email}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
