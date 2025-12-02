// src/pages/Appointments/BookAppointment.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function BookAppointment() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ appointmentTypeId: "", requestedDate: "" });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/appointment-types");
        setTypes(res.data?.data || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load appointment types");
      } finally {
        setLoading(false);
      }
    };
    loadTypes();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!form.appointmentTypeId || !form.requestedDate) {
      setError("Please select type and date.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        appointmentTypeId: form.appointmentTypeId,
        requestedDate: form.requestedDate,
      };
      const res = await axios.post("/appointments", payload);
      setSuccessMsg("Request submitted — clinic manager will review it.");
      // optionally redirect patient to their appointments page
      setTimeout(() => navigate("/appointments/my"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Request Appointment</h2>

        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        {successMsg && <div className="mb-3 p-2 bg-green-100 text-green-700 rounded">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Service</label>
            <select
              name="appointmentTypeId"
              value={form.appointmentTypeId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">— select a service —</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Requested Date</label>
            <input
              name="requestedDate"
              type="date"
              value={form.requestedDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-3 py-2 border rounded hover:bg-gray-50"
            >
              ← Back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {submitting ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}