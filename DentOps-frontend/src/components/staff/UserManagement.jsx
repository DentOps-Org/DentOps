import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, createUser, updateUser, deleteUser } from '../../redux/slices/userSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filter, setFilter] = useState({ role: '', status: '' });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'PATIENT',
    phone: '',
    specialization: 'DENTIST',
    isVerified: true
  });
  
  useEffect(() => {
    dispatch(getUsers(filter));
  }, [dispatch, filter]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      dispatch(updateUser({ id: editingUser._id, userData: formData }));
    } else {
      dispatch(createUser(formData));
    }
    
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'PATIENT',
      phone: '',
      specialization: 'DENTIST',
      isVerified: true
    });
    setShowAddForm(false);
    setEditingUser(null);
  };
  
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      specialization: user.specialization || 'DENTIST',
      isVerified: user.isVerified
    });
    setShowAddForm(true);
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };
  
  const handleToggleVerification = (id, currentStatus) => {
    dispatch(updateUser({ 
      id, 
      userData: { isVerified: !currentStatus } 
    }));
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
  
  // Only clinic managers can access this component
  if (currentUser?.specialization !== 'CLINIC_MANAGER') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only Clinic Managers can access user management.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-700">User Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Add New User
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Role</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filter.role}
              onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              <option value="PATIENT">Patient</option>
              <option value="DENTAL_STAFF">Dental Staff</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ role: '', status: '' })}
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
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name*</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Role*</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DENTAL_STAFF">Dental Staff</option>
                </select>
              </div>
              
              {formData.role === 'DENTAL_STAFF' && (
                <div>
                  <label className="block text-gray-700 mb-2">Specialization*</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="DENTIST">Dentist</option>
                    <option value="CLINIC_MANAGER">Clinic Manager</option>
                  </select>
                </div>
              )}
              
              {!editingUser && (
                <div>
                  <label className="block text-gray-700 mb-2">Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required={!editingUser}
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVerified"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isVerified" className="text-gray-700">
                  Verified User
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingUser(null);
                  setFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    role: 'PATIENT',
                    phone: '',
                    specialization: 'DENTIST',
                    isVerified: true
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Users</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.role === 'DENTAL_STAFF' ? 
                          `${user.specialization || 'Dental Staff'}` : 
                          'Patient'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isVerified ? 
                          'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleVerification(user._id, user.isVerified)}
                          className="text-secondary-600 hover:text-secondary-900"
                        >
                          {user.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        {user._id !== currentUser._id && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
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

export default UserManagement;
