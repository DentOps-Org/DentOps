import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const PatientMedicalRecords = () => {
  const { user } = useSelector((state) => state.auth);
  const [records, setRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'OTHER',
    title: '',
    notes: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/records?patientId=${user._id || user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecords(result.data || []);
      } else {
        setError('Failed to fetch medical records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'file' ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.notes) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Form data being sent:', formData);
      
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('notes', formData.notes);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }
      
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      
      const response = await fetch('http://localhost:5000/records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      console.log('Response status:', response.status);
      console.log('Response result:', result);
      
      if (response.ok) {
        setRecords([result.data, ...records]);
        setFormData({
          type: 'OTHER',
          title: '',
          notes: '',
          file: null
        });
        setShowAddForm(false);
        alert('Medical record added successfully!');
      } else {
        console.error('Error response:', result);
        alert(`Error: ${result.message || 'Failed to add medical record'}`);
      }
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add medical record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/records/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setRecords(records.filter(record => record._id !== id));
        alert('Medical record deleted successfully!');
      } else {
        setError('Failed to delete medical record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setError('Failed to delete medical record');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">My Medical Records</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
        >
          + Upload Document
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Personal Document</h2>
          <p className="text-gray-600 mb-4">
            Upload your personal documents like previous X-rays, insurance papers, or referral letters.
            Clinical records are added by your dentist during appointments.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Document Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="XRAY">Previous X-Rays</option>
                      <option value="INSURANCE">Insurance Documents</option>
                      <option value="CONSENT_FORM">Consent Forms</option>
                      <option value="LAB_RESULT">Lab Results</option>
                      <option value="OTHER">Other Documents</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Document Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 'Previous X-ray from 2023'"
                      required
                    />
                  </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Upload File (Optional)</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 mb-2 font-medium">Description *</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe this document (e.g., 'Previous X-ray from 2023', 'Insurance card copy')..."
                required
              ></textarea>
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
                {loading ? 'Adding...' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Medical Records ({records.length})</h2>
        </div>
        
        {loading && !showAddForm ? (
          <div className="p-6 text-center">Loading medical records...</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No medical records found. Add some records to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.type === 'XRAY' ? 'bg-blue-100 text-blue-800' :
                        record.type === 'NOTE' ? 'bg-green-100 text-green-800' :
                        record.type === 'PRESCRIPTION' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.isClinicalRecord 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.isClinicalRecord ? 'Clinical Record (Read Only)' : 'My Upload (Editable)'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(record.uploadedAt)}
                      </span>
                      {record.isClinicalRecord && (
                        <span className="text-xs text-gray-400">
                          by {record.uploadedBy?.fullName || 'Dentist'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-2">{record.notes}</p>
                    
                    {record.fileName && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">{record.fileName}</span>
                        {record.fileUrl && (
                          <a
                            href={`http://localhost:5000/records/${record._id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!record.isClinicalRecord && (
                    <button
                      onClick={() => handleDelete(record._id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalRecords;
