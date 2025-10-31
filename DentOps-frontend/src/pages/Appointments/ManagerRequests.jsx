// src/pages/Appointments/ManagerRequests.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ManagerRequests() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // simple local form state keyed by request id
  const [assignState, setAssignState] = useState({}); // { [reqId]: { dentalStaffId, startTime } }

  useEffect(() => {
    if (!user) return;
    // only manager should be here (guard)
    if (user.specialization !== "CLINIC_MANAGER") {
      navigate("/dashboard");
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [rres, pres] = await Promise.all([
          axios.get("/appointments/requests"),
          axios.get("/users/providers") // provider list
        ]);
        setRequests(rres.data?.data || rres.data || []);
        setProviders(pres.data?.data || pres.data || []);
      } catch (e) {
        console.error(e);
        setErr(e.response?.data?.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, navigate]);

  const handleAssignChange = (reqId, field, value) => {
    setAssignState(prev => ({ ...prev, [reqId]: { ...(prev[reqId]||{}), [field]: value } }));
  };

  const submitAssign = async (reqId) => {
    const s = assignState[reqId];
    if (!s || !s.dentalStaffId || !s.startTime) {
      return alert("Select dentist and start time");
    }

    try {
      const res = await axios.post(`/appointments/${reqId}/confirm`, {
        dentalStaffId: s.dentalStaffId,
        startTime: s.startTime
      });
      // remove confirmed request from list
      setRequests(prev => prev.filter(r => r._id !== reqId));
      alert("Assigned & confirmed");
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to confirm appointment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pending Appointment Requests</h2>
          <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded">← Back</button>
        </div>

        {loading && <div>Loading...</div>}
        {err && <div className="p-2 bg-red-100 text-red-700 rounded">{err}</div>}

        {requests.length === 0 && !loading && <div className="text-gray-600">No pending requests.</div>}

        <div className="space-y-4 mt-4">
          {requests.map(r => (
            <div key={r._id} className="p-4 border rounded flex flex-col md:flex-row md:justify-between gap-4">
              <div>
                <div className="font-semibold">{r.appointmentTypeId?.name || "Service"}</div>
                <div className="text-sm text-gray-600">Patient: {r.patientId?.fullName || r.patientId?.email}</div>
                <div className="text-sm text-gray-600">Requested Date: {new Date(r.requestedDate).toLocaleDateString()}</div>
                <div className="text-sm text-gray-600">Notes: {r.notes || "—"}</div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-80">
                <select
                  value={assignState[r._id]?.dentalStaffId || ""}
                  onChange={(e) => handleAssignChange(r._id, "dentalStaffId", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select dentist</option>
                  {providers.map(p => (
                    <option key={p._id} value={p._id}>{p.fullName} {p.specialization ? `(${p.specialization})` : ""}</option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  value={assignState[r._id]?.startTime || ""}
                  onChange={(e) => handleAssignChange(r._id, "startTime", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />

                <div className="flex gap-2">
                  <button onClick={() => submitAssign(r._id)} className="bg-green-600 text-white px-3 py-2 rounded">Assign & Confirm</button>
                  <button onClick={() => {/* optionally implement reject or postpone */}} className="px-3 py-2 border rounded">Skip</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
