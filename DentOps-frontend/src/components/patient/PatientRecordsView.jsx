import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRecords } from '../../redux/slices/recordSlice';

const PatientRecordsView = () => {
  const dispatch = useDispatch();
  const { records, isLoading, error } = useSelector((state) => state.records);
  const { user } = useSelector((state) => state.auth);
  
  const [filter, setFilter] = useState({ 
    type: '', 
    includeArchived: false 
  });
  
  useEffect(() => {
    if (user) {
      dispatch(getRecords({ 
        patientId: user._id || user.id, 
        ...filter 
      }));
    }
  }, [dispatch, user, filter]);
  
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
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'XRAY':
        return 'bg-blue-100 text-blue-800';
      case 'NOTE':
        return 'bg-green-100 text-green-800';
      case 'PRESCRIPTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-700">My Medical Records</h1>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              onClick={() => setFilter({ type: '', includeArchived: false })}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Records List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Medical Records</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">Loading records...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : records?.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {record.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                      {record.isArchived && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Archived
                        </span>
                      )}
                    </div>
                    
                    {record.description && (
                      <p className="text-gray-600 mb-2">{record.description}</p>
                    )}
                    
                    {record.notes && (
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">Notes:</span> {record.notes}
                      </p>
                    )}
                    
                    {record.tags && record.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {record.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      <p>Uploaded by: {record.uploadedBy?.fullName || 'Unknown'}</p>
                      <p>Date: {formatDate(record.uploadedAt)}</p>
                    </div>
                  </div>
                  
                  {record.fileUrl && (
                    <div className="ml-4">
                      <a
                        href={`/api/records/${record._id}/download`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No records found. Your medical records will appear here once they are uploaded by your dental staff.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecordsView;
