// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload ?? true;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAuth(state, action) {
      const payload = action.payload;

      if (payload.user) {
        state.user = payload.user;
      } else if (payload.token && !state.user) {
        // handled later if needed (via /auth/me)
      }

      if (payload.token) {
        state.token = payload.token;
        localStorage.setItem("token", payload.token);
        state.isAuthenticated = true;
      }

      state.isLoading = false;
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setLoading, setError, setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

// -------------------------
// ✅ LOGIN
// -------------------------
export const loginUser = (formData, navigate) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    const res = await api.post("/auth/login", formData, { withCredentials: true });

    if (res.data?.user && res.data?.token) {
      dispatch(setAuth({ user: res.data.user, token: res.data.token }));
    } else if (res.data?.token) {
      dispatch(setAuth({ token: res.data.token }));
      try {
        const me = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${res.data.token}` },
        });
        dispatch(setAuth({ user: me.data.data }));
      } catch (err) {
        console.warn("fetch current user failed", err);
      }
    } else {
      dispatch(setError("Invalid login response from server"));
      return;
    }

    // ✅ redirect after successful login
    const user = res.data.user || (await (await api.get("/auth/me")).data?.data);
    if (user?.role === "PATIENT") navigate("/dashboard/patient");
    else if (user?.role === "DENTAL_STAFF" && user?.specialization === "DENTIST")
      navigate("/dashboard/dentist");
    else if (user?.role === "DENTAL_STAFF" && user?.specialization === "CLINIC_MANAGER")
      navigate("/dashboard/manager");
    else navigate("/");
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Login failed"));
  }
};

// -------------------------
// ✅ REGISTER
// -------------------------
export const registerUser = (formData, navigate) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const res = await api.post("/auth/register", formData, { withCredentials: true });

    // Expect backend to return token + user
    if (res.data?.user && res.data?.token) {
      dispatch(setAuth({ user: res.data.user, token: res.data.token }));
    } else if (res.data?.token) {
      dispatch(setAuth({ token: res.data.token }));
      try {
        const me = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${res.data.token}` },
        });
        dispatch(setAuth({ user: me.data.data }));
      } catch (err) {
        console.warn("fetch current user failed", err);
      }
    } else {
      dispatch(setError("Invalid registration response from server"));
      return;
    }

    // ✅ redirect based on role
    const user = res.data.user || (await (await api.get("/auth/me")).data?.data);
    if (user?.role === "PATIENT") navigate("/dashboard/patient");
    else if (user?.role === "DENTAL_STAFF" && user?.specialization === "DENTIST")
      navigate("/dashboard/dentist");
    else if (user?.role === "DENTAL_STAFF" && user?.specialization === "CLINIC_MANAGER")
      navigate("/dashboard/manager");
    else navigate("/");
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Registration failed"));
  }
};

// -------------------------
// ✅ LOAD USER FROM TOKEN (Auto-login on page load)
// -------------------------
export const loadUserFromToken = () => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    
    // No token = no auto-login
    if (!token) {
      return;
    }

    dispatch(setLoading(true));
    
    // Fetch current user using stored token
    const res = await api.get("/auth/me");
    
    if (res.data?.data || res.data?.user) {
      const userData = res.data.data || res.data.user;
      dispatch(setAuth({ user: userData }));
    } else {
      // Invalid response, clear auth
      dispatch(clearAuth());
    }
  } catch (err) {
    console.error("Auto-login failed:", err);
    
    // If 401 Unauthorized, token is expired/invalid
    if (err.response?.status === 401) {
      dispatch(clearAuth());
    } else {
      dispatch(setLoading(false));
    }
  }
};

// -------------------------
// ✅ LOGOUT
// -------------------------
export const logoutUser = (navigate) => async (dispatch) => {
  try {
    // Optional: Call backend logout endpoint if it exists
    // await api.post('/auth/logout');
    
    dispatch(clearAuth());
    
    if (navigate) {
      navigate('/login');
    }
  } catch (err) {
    console.error('Logout error:', err);
    // Still clear auth even if backend call fails
    dispatch(clearAuth());
    if (navigate) {
      navigate('/login');
    }
  }
};