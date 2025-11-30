// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../redux/slices/authSlice";
import api from "../api/axios"; // optional: to call backend logout

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    try {
      // optionally call backend logout to clear cookie
      try {
        await api.get("/auth/logout", { withCredentials: true });
      } catch (e) {
        // ignore if backend logout fails — still clear client state
      }

      // clear redux + localStorage
      dispatch(clearAuth());
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // compute dashboard route (simple)
  const dashboardRoute = (() => {
    if (!user) return "/";
    if (user.role === "PATIENT") return "/dashboard/patient";
    if (user.role === "DENTAL_STAFF") {
      if (user.specialization === "CLINIC_MANAGER") return "/dashboard/manager";
      return "/dashboard/dentist";
    }
    return "/";
  })();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: logo/title */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md font-semibold">
                DO
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-700">DentOps</div>
                <div className="text-xs text-gray-500 -mt-0.5">Dental clinic ops</div>
              </div>
            </Link>
          </div>

          {/* Right: user info and logout */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                    {user.fullName ? user.fullName.split(" ").map(n=>n[0]).slice(0,2).join("") : "U"}
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-700 font-medium">{user.fullName || "User"}</div>
                    <div className="text-xs text-gray-500">{user.role === "DENTAL_STAFF" ? user.specialization : user.role}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-sm text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
