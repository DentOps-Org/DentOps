// src/pages/Availability/AvailabilityManagerPage.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import AvailabilityList from "./AvailabilityList";
import { Link, useNavigate } from "react-router-dom";

export default function AvailabilityManagerPage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/users/providers");
        const list = (res.data && (res.data.data || res.data)) || [];
        setProviders(list);
        if (list.length && !selected) setSelected(list[0]._id);
      } catch (e) {
        console.error(e);
        setErr(e.response?.data?.message || "Failed to load providers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // load once

  // Back button handler — route to role-specific dashboard
  const handleBack = () => {
    if (user?.specialization === "CLINIC_MANAGER") return navigate("/dashboard/manager");
    if (user?.specialization === "DENTIST") return navigate("/dashboard/dentist");
    // fallback
    return navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Manage Dentist Availability</h1>
            <p className="text-sm text-gray-600">Create or edit weekly working hours for dentists.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="mr-2 inline-flex items-center gap-2 border px-3 py-2 rounded hover:bg-gray-50"
            >
              ← Back to Dashboard
            </button>

            {user?.specialization === "CLINIC_MANAGER" && (
              <Link to="/availability/new" className="bg-blue-600 text-white px-3 py-2 rounded">
                + New Availability
              </Link>
            )}
          </div>
        </div>

        {loading && <div className="text-gray-600">Loading providers...</div>}
        {err && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{err}</div>}

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Select dentist</label>
          <select
            value={selected || ""}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border rounded"
          >
            <option value="">-- Choose --</option>
            {providers.map((p) => (
              <option key={p._id} value={p._id}>
                {p.fullName} {p.specialization ? `(${p.specialization})` : ""}
              </option>
            ))}
          </select>
        </div>

        {!selected && <div className="text-gray-600">Select a dentist to view availability.</div>}

        {selected && (
          <AvailabilityList
            dentistId={selected}
            showManagerControls={user?.specialization === "CLINIC_MANAGER"}
          />
        )}
      </div>
    </div>
  );
}