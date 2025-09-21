import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './redux/slices/authSlice';

// Components
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BookAppointment from './components/patient/BookAppointment';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Try to fetch current user data if we have a token
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/patient-records"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['DENTAL_STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={['DENTAL_STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            
            <Route
              path="/availability"
              element={
                <ProtectedRoute allowedRoles={['DENTAL_STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/appointment-types"
              element={
                <ProtectedRoute allowedRoles={['DENTAL_STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['DENTAL_STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/all-availability"
              element={
                <ProtectedRoute allowedRoles={['DENTAL_STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['DENTAL_STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <footer className="bg-white py-4 shadow-inner">
          <div className="container mx-auto px-4 text-center text-gray-600">
            &copy; {new Date().getFullYear()} DentOps. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
