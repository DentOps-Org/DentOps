import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PatientSearch from './PatientSearch';

const StaffPatientRecords = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'NOTE',
    title: '',
    description: '',
    notes: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch records when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [selectedPatient]);

  const fetchRecords = async () => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/records?patientId=${selectedPatient._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecords(result.data || []);
      } else {
        setError('Failed to fetch patient records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to fetch patient records');
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
    
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    if (!formData.type || !formData.title) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('patientId', selectedPatient._id);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('notes', formData.notes);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }
      
      const response = await fetch('http://localhost:5000/records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setRecords([result.data, ...records]);
        setFormData({
          type: 'NOTE',
          title: '',
          description: '',
          notes: '',
          file: null
        });
        setShowAddForm(false);
        alert('Patient record added successfully!');
      } else {
        alert(`Error: ${result.message || 'Failed to add patient record'}`);
      }
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add patient record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

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
        alert('Record deleted successfully!');
      } else {
        setError('Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setError('Failed to delete record');
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

  const getRecordTypeColor = (type) => {
    switch (type) {
      case 'XRAY': return 'bg-blue-100 text-blue-800';
      case 'NOTE': return 'bg-green-100 text-green-800';
      case 'PRESCRIPTION': return 'bg-purple-100 text-purple-800';
      case 'LAB_RESULT': return 'bg-yellow-100 text-yellow-800';
      case 'CONSENT_FORM': return 'bg-orange-100 text-orange-800';
      case 'INSURANCE': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeLabel = (type) => {
    switch (type) {
      case 'XRAY': return 'X-Ray';
      case 'NOTE': return 'Clinical Note';
      case 'PRESCRIPTION': return 'Prescription';
      case 'LAB_RESULT': return 'Lab Result';
      case 'CONSENT_FORM': return 'Consent Form';
      case 'INSURANCE': return 'Insurance';
      default: return 'Other';
    }
  };

  // Check if user can manage patient records
  if (user?.role !== 'DENTAL_STAFF') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only Dental Staff can manage patient records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Patient Records Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Patient Search */}
      <PatientSearch 
        onPatientSelect={setSelectedPatient}
        selectedPatient={selectedPatient}
      />

      {selectedPatient && (
        <>
          {/* Add Record Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Records for {selectedPatient.fullName}
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              + Add Clinical Record
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Add Clinical Record</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Record Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="NOTE">Clinical Note</option>
                      <option value="XRAY">X-Ray</option>
                      <option value="PRESCRIPTION">Prescription</option>
                      <option value="LAB_RESULT">Lab Result</option>
                      <option value="CONSENT_FORM">Consent Form</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Treatment Plan, X-Ray Results"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-gray-700 mb-2 font-medium">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the record"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-gray-700 mb-2 font-medium">Clinical Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed clinical notes, observations, treatment details..."
                  ></textarea>
                </div>
                
                <div className="mt-4">
                  <label className="block text-gray-700 mb-2 font-medium">Upload File (Optional)</label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
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
              <h3 className="text-xl font-semibold">Patient Records ({records.length})</h3>
            </div>
            
            {loading && !showAddForm ? (
              <div className="p-6 text-center">Loading records...</div>
            ) : records.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No records found for this patient.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {records.map((record) => (
                  <div key={record._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(record.type)}`}>
                            {getRecordTypeLabel(record.type)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            record.isClinicalRecord 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {record.isClinicalRecord ? 'Clinical Record (Staff Created)' : 'Patient Upload'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(record.uploadedAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            by {record.uploadedBy?.fullName || 'Unknown'}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-1">{record.title}</h4>
                        {record.description && (
                          <p className="text-gray-600 mb-2">{record.description}</p>
                        )}
                        {record.notes && (
                          <p className="text-gray-700 mb-2">{record.notes}</p>
                        )}
                        
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
                      
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StaffPatientRecords;
