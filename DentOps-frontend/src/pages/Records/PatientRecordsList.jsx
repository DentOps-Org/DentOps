// src/pages/Records/PatientRecordsList.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function PatientRecordsList() {
  const { user } = useSelector(s => s.auth);
  const [records, setRecords] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRecords = async (email = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (email && user?.role === 'DENTAL_STAFF') {
        params.patientEmail = email;
      }
      
      const res = await axios.get('/records', { params });
      setRecords(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadRecords(searchEmail);
  };

  const handleClearSearch = () => {
    setSearchEmail('');
    loadRecords();
  };

  const getTypeColor = (type) => {
    const colors = {
      NOTE: 'bg-blue-100 text-blue-800',
      PRESCRIPTION: 'bg-green-100 text-green-800',
      XRAY: 'bg-purple-100 text-purple-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.OTHER;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back to Dashboard - Top Left */}
        <div className="mb-4">
          <Link
            // to="/dashboard/patient"
            to={user?.role === 'DENTAL_STAFF' ? '/dashboard/dentist' : '/dashboard/patient'}
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
                <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Medical Records</h2>
            <p className="text-sm text-gray-600 mt-1">View your treatment history and medical records</p>
          </div>
          <div className="flex gap-3">
            {user?.role === 'DENTAL_STAFF' && (
              <Link
                to="/records/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Create Record
              </Link>
            )}
            
          </div>
        </div>

        {/* Search (only for dentists) */}
        {user?.role === 'DENTAL_STAFF' && (
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <input
              type="email"
              placeholder="Search by patient email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 border rounded px-4 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
            {searchEmail && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-6 py-2 border rounded hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </form>
        )}

        {/* Loading/Error States */}
        {loading && <div className="text-center py-8">Loading...</div>}
        {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

        {/* Records List */}
        {!loading && records.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            {searchEmail ? 'No records found for this patient.' : 'No patient records yet.'}
          </div>
        )}

        <div className="space-y-4">
          {records.map(record => (
            <div key={record._id} className="border rounded-lg p-5 hover:bg-gray-50 transition">
              {/* Header Row */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{record.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(record.type)}`}>
                      {record.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Patient: <span className="font-medium">{record.patientId?.fullName || 'Unknown'}</span>
                    {record.patientId?.email && ` (${record.patientId.email})`}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(record.uploadedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Description */}
              {record.description && (
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{record.description}</p>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t">
                <div>
                  Created by: {record.uploadedBy?.fullName || 'Unknown'}
                  {record.appointmentId && (
                    <span className="ml-3">
                      📋 Linked to appointment
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
