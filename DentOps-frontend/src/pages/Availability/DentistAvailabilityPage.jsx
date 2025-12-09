// src/pages/Availability/DentistAvailabilityPage.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

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
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard - Top Left */}
        <div className="mb-4">
          <Link
            to="/dashboard/dentist"
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Working Slots</h2>
            <p className="text-sm text-gray-600 mt-1">Your recurring weekly schedule (read-only)</p>
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
    </div>
  );
}
