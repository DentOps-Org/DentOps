import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, resetAuthError } from '../redux/slices/authSlice';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
    phone: '',
    specialization: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(resetAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match!");

    const { confirmPassword, ...data } = formData;
    if (data.role === 'PATIENT') delete data.specialization;
    dispatch(register(data));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full mb-3 px-3 py-2 border rounded"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded"
        >
          <option value="PATIENT">Patient</option>
          <option value="DENTAL_STAFF">Dental Staff</option>
        </select>

        {formData.role === 'DENTAL_STAFF' && (
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full mb-3 px-3 py-2 border rounded"
            required
          >
            <option value="">Select Specialization</option>
            <option value="DENTIST">Dentist</option>
            <option value="CLINIC_MANAGER">Clinic Manager</option>
          </select>
        )}

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-3 px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full mb-4 px-3 py-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
