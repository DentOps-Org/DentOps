import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recordService } from '../../services/api';

const initialState = {
  records: [],
  record: null,
  isLoading: false,
  error: null,
};

// Get patient records with optional filters
export const getRecords = createAsyncThunk(
  'records/getRecords',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await recordService.getRecords(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient records');
    }
  }
);

// Get single patient record
export const getRecord = createAsyncThunk(
  'records/getRecord',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recordService.getRecord(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient record');
    }
  }
);

// Create new patient record
export const createRecord = createAsyncThunk(
  'records/createRecord',
  async (recordData, { rejectWithValue }) => {
    try {
      const response = await recordService.createRecord(recordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create patient record');
    }
  }
);

// Update patient record
export const updateRecord = createAsyncThunk(
  'records/updateRecord',
  async ({ id, recordData }, { rejectWithValue }) => {
    try {
      const response = await recordService.updateRecord(id, recordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update patient record');
    }
  }
);

// Delete patient record
export const deleteRecord = createAsyncThunk(
  'records/deleteRecord',
  async (id, { rejectWithValue }) => {
    try {
      await recordService.deleteRecord(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete patient record');
    }
  }
);

// Archive patient record
export const archiveRecord = createAsyncThunk(
  'records/archiveRecord',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recordService.archiveRecord(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to archive patient record');
    }
  }
);

const recordSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    clearRecord: (state) => {
      state.record = null;
    },
    clearRecordError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get patient records
      .addCase(getRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload;
      })
      .addCase(getRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get single patient record
      .addCase(getRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.record = action.payload;
      })
      .addCase(getRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create patient record
      .addCase(createRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records.unshift(action.payload);
      })
      .addCase(createRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update patient record
      .addCase(updateRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.records.findIndex(rec => rec._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        state.record = action.payload;
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete patient record
      .addCase(deleteRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = state.records.filter(rec => rec._id !== action.payload);
        if (state.record && state.record._id === action.payload) {
          state.record = null;
        }
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Archive patient record
      .addCase(archiveRecord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(archiveRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.records.findIndex(rec => rec._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.record && state.record._id === action.payload._id) {
          state.record = action.payload;
        }
      })
      .addCase(archiveRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecord, clearRecordError } = recordSlice.actions;

export default recordSlice.reducer;
