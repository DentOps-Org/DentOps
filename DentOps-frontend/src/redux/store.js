import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice';
import inventoryReducer from './slices/inventorySlice';
import recordReducer from './slices/recordSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    inventory: inventoryReducer,
    records: recordReducer,
    users: userReducer,
  },
});

export default store;
