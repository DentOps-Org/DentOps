// src/pages/Appointments/PatientAppointments.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function PatientAppointments() {
  const { user } = useSelector((s) => s.auth);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Get all appointments (PENDING, CONFIRMED, COMPLETED, CANCELLED)
        let res;
        try {
          res = await axios.get(`/appointments?patientId=${user?.id}`);
        } catch (e) {
          res = await axios.get("/appointments/my");
        }
        setAppts(res.data?.data || res.data || []);
      } catch (error) {
        setErr(error.response?.data?.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
              <p className="text-sm text-gray-600 mt-1">View all your appointments including completed ones</p>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/appointments/new" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                + Request New
              </Link>
              <Link 
                to="/dashboard/patient" 
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {loading && <div className="text-center py-8">Loading...</div>}
          {err && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{err}</div>}

          {appts.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-600">
              No appointments found.
            </div>
          )}

          <div className="space-y-4 mt-4">
            {appts.map((a) => (
              <div key={a._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{a.appointmentTypeId?.name || "Service"}</h3>
                      {getStatusBadge(a.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Requested: {new Date(a.requestedDate).toLocaleDateString()}</div>
                      {a.status === "CONFIRMED" && a.startTime && (
                        <div className="text-blue-600 font-medium">
                          Scheduled: {new Date(a.startTime).toLocaleString()}
                        </div>
                      )}
                      {a.status === "COMPLETED" && a.startTime && (
                        <div className="text-green-600 font-medium">
                          Completed on: {new Date(a.startTime).toLocaleDateString()}
                        </div>
                      )}
                      {a.dentalStaffId && (
                        <div>Dentist: {a.dentalStaffId?.fullName || "Assigned"}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {a.status === "COMPLETED" && (
                      <Link
                        to="/records"
                        className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        View Records
                      </Link>
                    )}
                    <Link 
                      to={`/appointments/${a._id}`} 
                      className="px-3 py-2 border rounded hover:bg-gray-100 text-sm"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
