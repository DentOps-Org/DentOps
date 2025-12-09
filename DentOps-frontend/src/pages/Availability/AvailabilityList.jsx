// src/pages/Availability/AvailabilityList.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function AvailabilityList({ dentistId, showManagerControls = false }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dentistId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/availability/${dentistId}`);
        setBlocks(res.data.data || []);
      } catch (e) {
        console.error(e);
        setErr(e.response?.data?.message || "Failed to fetch availability");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dentistId]);

  const onDelete = async (id) => {
    if (!confirm("Delete this availability block?")) return;
    try {
      await axios.delete(`/availability/${id}`);
      setBlocks(prev => prev.filter(b => b._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  if (!dentistId) return null;

  return (
    <div>
      {loading && <div className="text-gray-600">Loading availability...</div>}
      {err && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{err}</div>}

      <div className="grid gap-3">
        {blocks.length === 0 && !loading && <div className="text-gray-600">No availability set for this dentist.</div>}

        {blocks.map(b => (
          <div key={b._id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">Weekday: {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][b.weekday]}</div>
              <div className="text-sm text-gray-600">
                {b.startTimeOfDay} — {b.endTimeOfDay}
              </div>
              <div className="text-xs text-gray-400 mt-1">Created: {new Date(b.createdAt).toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2">
              {showManagerControls ? (
                <>
                  <button onClick={() => navigate(`/availability/${b._id}/edit`)} className="text-indigo-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => onDelete(b._id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </>
              ) : (
                <span className="text-sm text-gray-500">Read-only</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
