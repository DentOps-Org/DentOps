import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import appointmentTypeReducer from "./slices/appointmentTypeSlice";
import inventoryReducer from "./slices/inventorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointmentTypes: appointmentTypeReducer,
    inventory: inventoryReducer,
  },
});
