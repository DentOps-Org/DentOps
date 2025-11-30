// src/pages/Dashboard/DentistDashboard.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "../../api/axios";

/* Helpers */
function formatTime(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DentistDashboard() {
  const { user } = useSelector((s) => s.auth || {});

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // helper: get id from user (handles _id or id)
  const userId = user?._id ?? user?.id ?? null;

  useEffect(() => {
    if (!userId) return;

    // Only dentists should fetch this dashboard list
    if (user.role !== "DENTAL_STAFF" && user.specialization !== "DENTIST") {
      setErr("You are not a dentist. This page is for dentist accounts only.");
      setAppointments([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await axios.get("/appointments", {
          params: {
            dentalStaffId: userId
            // Fetch both CONFIRMED and COMPLETED appointments
          }
        });

        const payload = res.data;

        // Normalize response shape safely
        let dataArr = [];
        if (Array.isArray(payload)) dataArr = payload;
        else if (Array.isArray(payload?.data)) dataArr = payload.data;
        else if (Array.isArray(payload?.data?.data)) dataArr = payload.data.data;
        else dataArr = [];

        // Get all appointments with startTime and sort by date
        const filtered = dataArr
          .filter(a => a.startTime && (a.status === 'CONFIRMED' || a.status === 'COMPLETED'))
          .map(a => ({ ...a, _start: new Date(a.startTime) }))
          .sort((x, y) => x._start - y._start);

        setAppointments(filtered);
      } catch (error) {
        console.error("Failed loading appointments:", error);

        if (error.response?.status === 401) {
          setErr("Not authenticated. Please login again.");
        } else if (error.response?.status === 403) {
          setErr("Not authorized to fetch appointments (check role).");
        } else if (error.response?.data?.message) {
          setErr(error.response.data.message);
        } else {
          setErr("Failed to load appointments.");
        }

        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, user?.role, user?.specialization]);

  // Categorize appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(a => a._start >= now && a.status === 'CONFIRMED');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').slice(0, 5); // Show last 5

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Dentist Dashboard</h1>
          <p className="text-gray-600">Manage your schedule and patient records.</p>
        </div>

        {/* quick actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/appointment-types" className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">View Appointment Types</Link>
          <Link to="/availability/me" className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">My Timings</Link>
          <Link to="/records" className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">Patient Records</Link>
        </div>

        {/* Appointments Section */}
        <div className="mt-8">
          {loading && <div className="p-4 text-gray-600">Loading appointments…</div>}
          {err && <div className="p-3 bg-red-100 text-red-700 rounded">{err}</div>}

          {!loading && !err && (
            <>
              {/* Upcoming Appointments */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                {upcomingAppointments.length === 0 ? (
                  <div className="p-4 text-gray-600 bg-gray-50 rounded">No upcoming appointments.</div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map(appt => (
                      <div key={appt._id} className="border rounded p-3 flex justify-between items-center bg-blue-50">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {appt.appointmentTypeId?.name ?? "Service"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Patient: {appt.patientId?.fullName ?? appt.patientId?.name ?? "Unknown"}
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            📅 {appt._start.toLocaleDateString()} at {formatTime(appt._start)}
                          </div>
                          {appt.notes && <div className="text-sm text-gray-500 mt-1">{appt.notes}</div>}
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {appt.appointmentTypeId?.durationMinutes ?? '-'} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Appointments */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Recently Completed</h2>
                {completedAppointments.length === 0 ? (
                  <div className="p-4 text-gray-600 bg-gray-50 rounded">No completed appointments yet.</div>
                ) : (
                  <div className="space-y-3">
                    {completedAppointments.map(appt => (
                      <div key={appt._id} className="border rounded p-3 flex justify-between items-center bg-green-50">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {appt.appointmentTypeId?.name ?? "Service"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Patient: {appt.patientId?.fullName ?? appt.patientId?.name ?? "Unknown"}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            ✅ Completed on {appt._start.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {appt.appointmentTypeId?.durationMinutes ?? '-'} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
