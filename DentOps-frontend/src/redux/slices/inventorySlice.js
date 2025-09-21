import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from '../../services/api';

const initialState = {
  inventoryItems: [],
  inventoryItem: null,
  lowStockItems: [],
  isLoading: false,
  error: null,
};

// Get inventory items with optional filters
export const getInventoryItems = createAsyncThunk(
  'inventory/getInventoryItems',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryItems(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory items');
    }
  }
);

// Get single inventory item
export const getInventoryItem = createAsyncThunk(
  'inventory/getInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryItem(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory item');
    }
  }
);

// Create new inventory item
export const createInventoryItem = createAsyncThunk(
  'inventory/createInventoryItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createInventoryItem(itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create inventory item');
    }
  }
);

// Update inventory item
export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateInventoryItem(id, itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory item');
    }
  }
);

// Delete inventory item
export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryService.deleteInventoryItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete inventory item');
    }
  }
);

// Adjust inventory quantity
export const adjustInventoryQuantity = createAsyncThunk(
  'inventory/adjustInventoryQuantity',
  async ({ id, delta }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.adjustInventoryQuantity(id, delta);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust inventory quantity');
    }
  }
);

// Get low stock items
export const getLowStockItems = createAsyncThunk(
  'inventory/getLowStockItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getLowStockItems();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock items');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryItem: (state) => {
      state.inventoryItem = null;
    },
    clearInventoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get inventory items
      .addCase(getInventoryItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInventoryItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryItems = action.payload;
      })
      .addCase(getInventoryItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get single inventory item
      .addCase(getInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryItem = action.payload;
      })
      .addCase(getInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create inventory item
      .addCase(createInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryItems.push(action.payload);
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update inventory item
      .addCase(updateInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inventoryItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.inventoryItems[index] = action.payload;
        }
        state.inventoryItem = action.payload;
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete inventory item
      .addCase(deleteInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryItems = state.inventoryItems.filter(item => item._id !== action.payload);
        if (state.inventoryItem && state.inventoryItem._id === action.payload) {
          state.inventoryItem = null;
        }
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Adjust inventory quantity
      .addCase(adjustInventoryQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adjustInventoryQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inventoryItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.inventoryItems[index] = action.payload;
        }
        if (state.inventoryItem && state.inventoryItem._id === action.payload._id) {
          state.inventoryItem = action.payload;
        }
      })
      .addCase(adjustInventoryQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get low stock items
      .addCase(getLowStockItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lowStockItems = action.payload;
      })
      .addCase(getLowStockItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInventoryItem, clearInventoryError } = inventorySlice.actions;

export default inventorySlice.reducer;
