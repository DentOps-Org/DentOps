// src/pages/Availability/DentistAvailabilityPage.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DentistAvailabilityPage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Only DENTAL_STAFF should access; otherwise redirect
    if (user.role !== "DENTAL_STAFF") {
      navigate("/dashboard");
      return;
    }

    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await axios.get(`/availability/${user.id}`);
        const arr = (res.data && (res.data.data || res.data)) || [];
        // sort by weekday
        arr.sort((a, b) => a.weekday - b.weekday);
        setBlocks(arr);
      } catch (e) {
        console.error(e);
        setErr(e.response?.data?.message || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">My Working Slots</h1>
            <p className="text-sm text-gray-600">Your recurring weekly schedule (read-only).</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/dentist")}
            className="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading && <div className="text-gray-600">Loading...</div>}
        {err && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{err}</div>}

        <div className="space-y-3">
          {blocks.length === 0 && !loading && (
            <div className="text-gray-600">No availability set. Contact your clinic manager.</div>
          )}

          {blocks.map((b) => (
            <div key={b._id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{WEEKDAY_NAMES[b.weekday]}</div>
                <div className="text-sm text-gray-600">{b.startTimeOfDay} — {b.endTimeOfDay}</div>
                <div className="text-xs text-gray-400 mt-1">Created: {new Date(b.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
