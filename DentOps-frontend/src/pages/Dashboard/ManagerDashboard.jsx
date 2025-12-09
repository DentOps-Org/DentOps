// src/pages/Dashboard/ManagerDashboard.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointmentTypes } from "../../redux/slices/appointmentTypeSlice";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "../../api/axios";

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { types = [], isLoading: typesLoading } = useSelector((s) => s.appointmentTypes || {});
  const [pendingCount, setPendingCount] = useState(null);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingErr, setPendingErr] = useState(null);

  useEffect(() => {
    dispatch(fetchAppointmentTypes());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    const loadPending = async () => {
      setLoadingPending(true);
      setPendingErr(null);
      try {
        // backend route: GET /appointments/requests (manager-only)
        const res = await axios.get("/appointments/requests?status=PENDING");
        if (!mounted) return;
        // try to support both shapes: { data: { count, data } } or { data: [...] }
        const data = res.data?.data ?? res.data;
        const count = Array.isArray(data) ? data.length : res.data?.count ?? 0;
        setPendingCount(count);
      } catch (err) {
        console.error("Failed to load pending requests:", err);
        if (!mounted) return;
        // If route is protected or unavailable, show 0 and keep error for debugging
        setPendingCount(0);
        setPendingErr(err.response?.data?.message || err.message || "Failed to load");
      } finally {
        if (mounted) setLoadingPending(false);
      }
    };
    loadPending();
    // refresh pending count every 30s while on dashboard (optional helpful behavior)
    const iv = setInterval(loadPending, 30000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  const countTypes = types.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
            Clinic Manager Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Appointment types card */}
            <div className="p-5 border rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold">Appointment Types</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create and manage service durations.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">{typesLoading ? "..." : countTypes}</div>
                <div className="flex gap-2 w-2/3">
                  <Link
                    to="/appointment-types"
                    className="flex-1 bg-gray-100 py-2 rounded text-center hover:bg-gray-200"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => navigate("/appointment-types/new")}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    New
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory card */}
            <div className="p-5 border rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold">Inventory</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage stock and quantities.
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to="/inventory"
                  className="flex-1 bg-gray-100 py-2 rounded text-center hover:bg-gray-200"
                >
                  View
                </Link>
                <Link
                  to="/inventory/new"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-center"
                >
                  New Item
                </Link>
              </div>
            </div>

            {/* Availability card */}
            <div className="p-5 border rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold">Dentist Availability</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create / edit dentist weekly working hours. Dentists can view their slots.
                </p>
              </div>

              <div className="mt-4">
                <Link to="/availability" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Manage Availability
                </Link>
              </div>
            </div>
          </div>

          {/* Pending requests (full width below) */}
          <div className="mt-8">
            <div className="p-6 bg-gradient-to-r from-white to-gray-50 border rounded-lg flex items-center justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-semibold">Pending Requests</h3>
                <p className="text-sm text-gray-500 mt-1">
                  First-come, first-served patient appointment requests waiting assignment.
                </p>
                {pendingErr && (
                  <div className="text-sm text-red-600 mt-2">Error: {pendingErr}</div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {loadingPending ? "…" : pendingCount ?? 0}
                  </div>
                  <div className="text-sm text-gray-500">incoming</div>
                </div>

                <div>
                  <Link
                    to="/appointments/requests"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Open Requests
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
