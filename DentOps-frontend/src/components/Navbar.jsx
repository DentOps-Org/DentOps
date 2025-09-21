import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-blue-600 text-xl font-bold">DentOps</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                {user?.role === 'PATIENT' && (
                  <>
                    <Link to="/book-appointment" className="text-gray-700 hover:text-blue-600">
                      Request Appointment
                    </Link>
                    <Link to="/appointments" className="text-gray-700 hover:text-blue-600">
                      My Appointments
                    </Link>
                    <Link to="/patient-records" className="text-gray-700 hover:text-blue-600">
                      My Records
                    </Link>
                  </>
                )}
                        {user?.role === 'DENTAL_STAFF' && (
                          <>
                            <Link to="/availability" className="text-gray-700 hover:text-blue-600">
                              My Availability
                            </Link>
                            <Link to="/appointments" className="text-gray-700 hover:text-blue-600">
                              Appointments
                            </Link>
                            <Link to="/inventory" className="text-gray-700 hover:text-blue-600">
                              Inventory
                            </Link>
                            <Link to="/patients" className="text-gray-700 hover:text-blue-600">
                              Patient Records
                            </Link>
                            <Link to="/appointment-types" className="text-gray-700 hover:text-blue-600">
                              Appointment Types
                            </Link>
                    {user?.specialization === 'MANAGER' && (
                      <>
                        <Link to="/all-availability" className="text-gray-700 hover:text-blue-600">
                          All Dentist Availability
                        </Link>
                        <Link to="/users" className="text-gray-700 hover:text-blue-600">
                          User Management
                        </Link>
                        <Link to="/reports" className="text-gray-700 hover:text-blue-600">
                          Reports
                        </Link>
                      </>
                    )}
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
                <span className="text-sm text-gray-500">
                  Hello, {user?.fullName || 'User'}
                </span>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
