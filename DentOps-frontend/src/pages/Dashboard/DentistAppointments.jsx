// src/pages/Dashboard/DentistAppointments.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function DentistAppointments() {
  const { user } = useSelector((s) => s.auth);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/appointments?dentalStaffId=${user?.id}&status=CONFIRMED`);
        setAppts(res.data?.data || res.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Confirmed Appointments</h2>
          <Link to="/dashboard/dentist" className="text-sm text-gray-500">Back to Dashboard</Link>
        </div>

        {loading && <div>Loading...</div>}
        {err && <div className="p-2 bg-red-100 text-red-700 rounded">{err}</div>}

        {appts.length === 0 && !loading && <div className="text-gray-600">No confirmed appointments.</div>}

        <div className="space-y-3 mt-4">
          {appts.map(a => (
            <div key={a._id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{a.appointmentTypeId?.name}</div>
                <div className="text-sm text-gray-600">Patient: {a.patientId?.fullName || a.patientId?.email}</div>
                <div className="text-sm text-gray-600">When: {new Date(a.startTime).toLocaleString()} — {new Date(a.endTime).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <Link to={`/appointments/${a._id}`} className="text-blue-600">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
