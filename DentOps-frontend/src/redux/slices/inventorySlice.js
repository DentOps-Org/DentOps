// src/redux/slices/inventorySlice.js
import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const slice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setLoading(state, action) { state.isLoading = action.payload ?? true; },
    setError(state, action) { state.error = action.payload; state.isLoading = false; },
    setItems(state, action) { state.items = action.payload; state.isLoading = false; state.error = null; },
    addItem(state, action) { state.items.push(action.payload); state.isLoading = false; },
    updateItem(state, action) {
      const idx = state.items.findIndex(i => i._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
      state.isLoading = false;
    },
    removeItem(state, action) {
      state.items = state.items.filter(i => i._id !== action.payload);
      state.isLoading = false;
    },
  }
});

export const { setLoading, setError, setItems, addItem, updateItem, removeItem } = slice.actions;
export default slice.reducer;

/* -------------- Async actions (manual) -------------- */

export const fetchInventory = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.get("/inventory");
    dispatch(setItems(res.data.data || []));
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Failed to fetch inventory"));
  }
};

export const createInventoryItem = (payload, navigate) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.post("/inventory", payload);
    dispatch(addItem(res.data.data));
    if (navigate) navigate("/inventory");
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Create failed"));
  }
};

export const updateInventoryItem = (id, payload, navigate) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.put(`/inventory/${id}`, payload);
    dispatch(updateItem(res.data.data));
    if (navigate) navigate("/inventory");
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Update failed"));
  }
};

export const deleteInventoryItem = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await api.delete(`/inventory/${id}`);
    dispatch(removeItem(id));
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Delete failed"));
  }
};

export const adjustInventoryQuantity = (id, delta) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await api.put(`/inventory/${id}/adjust`, { delta });
    dispatch(updateItem(res.data.data));
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Adjust failed"));
  }
};
