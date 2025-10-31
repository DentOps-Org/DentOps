import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  types: [],
  isLoading: false,
  error: null,
};

const slice = createSlice({
  name: "appointmentTypes",
  initialState,
  reducers: {
    setLoading(state, action) { state.isLoading = action.payload ?? true; },
    setError(state, action) { state.error = action.payload; state.isLoading = false; },
    setTypes(state, action) { state.types = action.payload; state.isLoading = false; state.error = null; },
    addType(state, action) { state.types.push(action.payload); state.isLoading = false; },
    updateType(state, action) {
      const idx = state.types.findIndex(t => t._id === action.payload._id);
      if (idx !== -1) state.types[idx] = action.payload;
      state.isLoading = false;
    },
    removeType(state, action) {
      state.types = state.types.filter(t => t._id !== action.payload);
      state.isLoading = false;
    }
  }
});

export const { setLoading, setError, setTypes, addType, updateType, removeType } = slice.actions;
export default slice.reducer;

/* ---------- Async actions (manual) ---------- */

// Fetch all appointment types
export const fetchAppointmentTypes = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get("/appointment-types");
    dispatch(setTypes(res.data.data || []));
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Failed to fetch appointment types"));
  }
};

// Create appointment type (Clinic Manager)
export const createAppointmentType = (payload, navigate) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.post("/appointment-types", payload);
    dispatch(addType(res.data.data));
    if (navigate) navigate("/appointment-types");
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Create failed";
    dispatch(setError(msg));
  }
};

// Update appointment type
export const updateAppointmentType = (id, payload, navigate) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.put(`/appointment-types/${id}`, payload);
    dispatch(updateType(res.data.data));
    if (navigate) navigate("/appointment-types");
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Update failed";
    dispatch(setError(msg));
  }
};

// Delete appointment type (hard delete)
export const deleteAppointmentType = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await api.delete(`/appointment-types/${id}`);
    dispatch(removeType(id));
  } catch (err) {
    const msg = err.response?.data?.message || "Delete failed";
    dispatch(setError(msg));
  }
};