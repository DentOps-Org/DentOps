// src/pages/Appointments/DentistAppointments.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function DentistAppointments() {
  const { user } = useSelector((s) => s.auth);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/appointments?dentalStaffId=${user?.id}`);
      setAppts(res.data?.data || res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAppointments();
  }, [user]);

  const handleComplete = async (appointmentId) => {
    if (!window.confirm('Mark this appointment as completed?')) {
      return;
    }

    try {
      await axios.post(`/appointments/${appointmentId}/complete`);
      loadAppointments(); // Refresh list
      alert('Appointment marked as complete! You can now create a patient record.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Appointments</h2>
          <Link to="/dashboard/dentist" className="text-sm text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>

        {loading && <div>Loading...</div>}
        {err && <div className="p-2 bg-red-100 text-red-700 rounded">{err}</div>}

        {appts.length === 0 && !loading && <div className="text-gray-600">No appointments.</div>}

        <div className="space-y-3 mt-4">
          {appts.map(a => (
            <div key={a._id} className="p-4 border rounded hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{a.appointmentTypeId?.name || "Appointment"}</div>
                    {getStatusBadge(a.status)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Patient: {a.patientId?.fullName || a.patientId?.email}
                  </div>
                  {a.status === 'CONFIRMED' && (
                    <div className="text-sm text-gray-600">
                      Scheduled: {new Date(a.startTime).toLocaleString()}
                    </div>
                  )}
                  {a.status === 'PENDING' && (
                    <div className="text-sm text-gray-600">
                      Requested: {new Date(a.requestedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {a.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleComplete(a._id)}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                    >
                      Mark as Complete
                    </button>
                  )}
                  
                  {a.status === 'COMPLETED' && (
                    <Link
                      to={`/records/new?appointmentId=${a._id}&patientId=${a.patientId._id}`}
                      className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Create Record
                    </Link>
                  )}
                  
                  <Link to={`/appointments/${a._id}`} className="px-3 py-2 border rounded hover:bg-gray-100 text-sm">
                    View Details
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
