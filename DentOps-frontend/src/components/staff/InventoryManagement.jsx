import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getInventoryItems, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  adjustInventoryQuantity 
} from '../../redux/slices/inventorySlice';

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const { inventoryItems, isLoading, error } = useSelector((state) => state.inventory);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [filter, setFilter] = useState({ category: '', lowStock: false });
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    unit: 'pcs',
    reorderThreshold: 0,
    supplier: ''
  });
  
  useEffect(() => {
    dispatch(getInventoryItems(filter));
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
    
    if (editingItem) {
      dispatch(updateInventoryItem({ id: editingItem._id, itemData: formData }));
    } else {
      dispatch(createInventoryItem(formData));
    }
    
    setFormData({
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      unit: 'pcs',
      reorderThreshold: 0,
      supplier: ''
    });
    setShowAddForm(false);
    setEditingItem(null);
  };
  
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku || '',
      category: item.category || '',
      quantity: item.quantity,
      unit: item.unit,
      reorderThreshold: item.reorderThreshold,
      supplier: item.supplier || ''
    });
    setShowAddForm(true);
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteInventoryItem(id));
    }
  };
  
  const handleAdjustQuantity = (id) => {
    if (adjustmentValue) {
      dispatch(adjustInventoryQuantity({ id, delta: parseInt(adjustmentValue) }));
      setAdjustmentValue('');
      setAdjustingItem(null);
    }
  };
  
  const getStockStatus = (item) => {
    if (item.quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (item.quantity <= item.reorderThreshold) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-700">Inventory Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Add New Item
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filter.category}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="Dental Tools">Dental Tools</option>
              <option value="Medications">Medications</option>
              <option value="Supplies">Supplies</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Stock Status</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filter.lowStock ? 'low' : 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, lowStock: e.target.value === 'low' }))}
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock Only</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ category: '', lowStock: false })}
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
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="Dental Tools">Dental Tools</option>
                  <option value="Medications">Medications</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="pcs">Pieces</option>
                  <option value="box">Box</option>
                  <option value="bottle">Bottle</option>
                  <option value="tube">Tube</option>
                  <option value="ml">ML</option>
                  <option value="mg">MG</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Quantity*</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Reorder Threshold*</label>
                <input
                  type="number"
                  name="reorderThreshold"
                  value={formData.reorderThreshold}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setFormData({
                    name: '',
                    sku: '',
                    category: '',
                    quantity: 0,
                    unit: 'pcs',
                    reorderThreshold: 0,
                    supplier: ''
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
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Inventory Items</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">Loading inventory...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Threshold
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
                {inventoryItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.sku && <div className="text-sm text-gray-500">SKU: {item.sku}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.reorderThreshold} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setAdjustingItem(item)}
                            className="text-secondary-600 hover:text-secondary-900"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Quantity Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adjust Quantity for {adjustingItem.name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Current Quantity: {adjustingItem.quantity} {adjustingItem.unit}</label>
                <label className="block text-gray-700 mb-2">Adjustment Value</label>
                <input
                  type="number"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter positive or negative value"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use positive values to add stock, negative values to remove stock
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setAdjustingItem(null);
                    setAdjustmentValue('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAdjustQuantity(adjustingItem._id)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Adjust
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
