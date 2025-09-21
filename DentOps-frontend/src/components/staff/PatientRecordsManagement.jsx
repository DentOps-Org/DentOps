import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getRecords, 
  createRecord, 
  updateRecord, 
  deleteRecord,
  archiveRecord 
} from '../../redux/slices/recordSlice';

const PatientRecordsManagement = () => {
  const dispatch = useDispatch();
  const { records, isLoading, error } = useSelector((state) => state.records);
  const { user } = useSelector((state) => state.auth);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState({ 
    patientId: '', 
    type: '', 
    includeArchived: false 
  });
  
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'OTHER',
    title: '',
    description: '',
    notes: '',
    tags: ''
  });
  
  useEffect(() => {
    dispatch(getRecords(filter));
  }, [dispatch, filter]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recordData = {
      ...formData,
      file: selectedFile
    };
    
    if (editingRecord) {
      dispatch(updateRecord({ id: editingRecord._id, recordData }));
    } else {
      dispatch(createRecord(recordData));
    }
    
    setFormData({
      patientId: '',
      type: 'OTHER',
      title: '',
      description: '',
      notes: '',
      tags: ''
    });
    setSelectedFile(null);
    setShowAddForm(false);
    setEditingRecord(null);
  };
  
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      patientId: record.patientId._id,
      type: record.type,
      title: record.title || '',
      description: record.description || '',
      notes: record.notes || '',
      tags: record.tags?.join(', ') || ''
    });
    setShowAddForm(true);
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      dispatch(deleteRecord(id));
    }
  };
  
  const handleArchive = (id) => {
    if (window.confirm('Are you sure you want to archive this record?')) {
      dispatch(archiveRecord(id));
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
        <h1 className="text-3xl font-bold text-primary-700">Patient Records Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Add New Record
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Patient ID</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={filter.patientId}
              onChange={(e) => setFilter(prev => ({ ...prev, patientId: e.target.value }))}
              placeholder="Enter patient ID"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Record Type</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="XRAY">X-Ray</option>
              <option value="NOTE">Note</option>
              <option value="PRESCRIPTION">Prescription</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeArchived"
              className="mr-2"
              checked={filter.includeArchived}
              onChange={(e) => setFilter(prev => ({ ...prev, includeArchived: e.target.checked }))}
            />
            <label htmlFor="includeArchived" className="text-gray-700">
              Include Archived
            </label>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ patientId: '', type: '', includeArchived: false })}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingRecord ? 'Edit Record' : 'Add New Record'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Patient ID*</label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Record Type*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="XRAY">X-Ray</option>
                  <option value="NOTE">Note</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">File Upload</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRecord(null);
                  setFormData({
                    patientId: '',
                    type: 'OTHER',
                    title: '',
                    description: '',
                    notes: '',
                    tags: ''
                  });
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingRecord ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Patient Records</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">Loading records...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{record.title}</div>
                        {record.description && (
                          <div className="text-sm text-gray-500">
                            {record.description.length > 50 ? 
                              `${record.description.substring(0, 50)}...` : 
                              record.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.patientId?.fullName || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.isArchived ? 
                          'bg-gray-100 text-gray-800' : 
                          'bg-green-100 text-green-800'
                      }`}>
                        {record.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {record.fileUrl && (
                          <a
                            href={`/api/records/${record._id}/download`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Download
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-secondary-600 hover:text-secondary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(record._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {record.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
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

export default PatientRecordsManagement;
