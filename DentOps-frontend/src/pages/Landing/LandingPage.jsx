import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [healthTip, setHealthTip] = useState(null);
  const [loadingTip, setLoadingTip] = useState(true);

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    if (user.role === 'PATIENT') return '/dashboard/patient';
    if (user.role === 'DENTAL_STAFF' && user.specialization === 'DENTIST') return '/dashboard/dentist';
    if (user.specialization === 'CLINIC_MANAGER') return '/dashboard/manager';
    return '/dashboard';
  };

  // Fetch daily health tip from third-party API
  useEffect(() => {
    const fetchHealthTip = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/health-tip`);
        if (response.data.success) {
          setHealthTip(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch health tip:', error);
        // Set fallback tip if API fails
        setHealthTip({
          tip: 'Visit your dentist regularly for optimal oral health.',
          author: 'DentOps Health Team'
        });
      } finally {
        setLoadingTip(false);
      }
    };

    fetchHealthTip();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Top navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">DentOps</h1>
        <nav className="space-x-4">
          {isAuthenticated ? (
            <Link
              to={getDashboardRoute()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-4">
        {/* Daily Health Tip Widget */}
        {!loadingTip && healthTip && (
          <div className="max-w-lg mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 text-left">
                <h3 className="text-sm font-medium text-green-800">💡 Daily Health Tip</h3>
                <p className="mt-1 text-sm text-green-700 italic">"{healthTip.tip}"</p>
                <p className="mt-1 text-xs text-green-600">— {healthTip.author}</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-lg bg-white rounded-2xl shadow-lg p-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Simplify Your Dental Practice
          </h2>
          <p className="text-gray-600 mb-8">
            Manage appointments, staff, and patient records — all in one place.
          </p>

          {isAuthenticated ? (
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Welcome back, {user?.fullName || user?.name || 'User'}!
              </p>
              <Link
                to={getDashboardRoute()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                Continue to Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} DentOps — All Rights Reserved
      </footer>
    </div>
  );
}
