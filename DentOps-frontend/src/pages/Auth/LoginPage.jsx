// src/pages/Auth/LoginPage.jsx
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { loginUser } from "../../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error, isAuthenticated } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    // if already logged in, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      if (user.role === "PATIENT") navigate("/dashboard/patient");
      else if (user.specialization === "CLINIC_MANAGER") navigate("/dashboard/manager");
      else if (user.specialization === "DENTIST") navigate("/dashboard/dentist");
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(loginUser(formData));
    // navigation handled in useEffect when auth state updates
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-600">
          Don’t have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
          <br />
          <Link to="/" className="text-sm text-gray-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
