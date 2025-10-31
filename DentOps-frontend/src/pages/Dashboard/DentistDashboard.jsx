// src/pages/Dashboard/DentistDashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "../../api/axios";

/* Helpers */
function formatTime(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function DentistDashboard() {
  const { user } = useSelector((s) => s.auth || {});
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // selectedDate (default: today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  });

  const selectedDateLabel = useMemo(() => {
    return selectedDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }, [selectedDate]);

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
            dentalStaffId: userId,
            status: "CONFIRMED"
            // backend may support date param; if it does you can add it here
          }
        });

        const payload = res.data;

        // Normalize response shape safely (avoid mixing ?? with &&)
        let dataArr = [];
        if (Array.isArray(payload)) dataArr = payload;
        else if (Array.isArray(payload?.data)) dataArr = payload.data;
        else if (Array.isArray(payload?.data?.data)) dataArr = payload.data.data; // handle nested shapes
        else dataArr = [];

        // Filter to selected date, only items with startTime and sort ascending
        const filtered = dataArr
          .filter(a => a.startTime) // only scheduled
          .map(a => ({ ...a, _start: new Date(a.startTime) }))
          .filter(a => isSameDate(a._start, selectedDate))
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
  }, [userId, selectedDate, user?.role, user?.specialization]);

  const prevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const goToday = () => { const t = new Date(); t.setHours(0,0,0,0); setSelectedDate(t); };

  const goBackToDashboard = () => {
    // send user back to their dashboard based on role/specialization
    if (!user) return navigate("/");
    if (user.role === "PATIENT") return navigate("/dashboard/patient");
    if (user.specialization === "CLINIC_MANAGER") return navigate("/dashboard/manager");
    // default dentist dashboard
    return navigate("/dashboard/dentist");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Dentist Dashboard</h1>
            <p className="text-gray-600">Manage your schedule and patient records.</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Logged in as</div>
            <div className="font-medium">{user?.fullName ?? "Dentist"}</div>
          </div>
        </div>

        {/* quick actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/appointment-types" className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">View Appointment Types</Link>
          <Link to="/availability/me" className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">My Timings</Link>
          <Link to="/patient-records" className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">Patient Records</Link>
        </div>

        {/* Today's appointments header */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Appointments — {selectedDateLabel}</h2>
            <p className="text-sm text-gray-500">Confirmed appointments for the selected day (ascending time)</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={prevDay} className="px-3 py-1 border rounded hover:bg-gray-50">Prev</button>
            <button onClick={goToday} className="px-3 py-1 border rounded hover:bg-gray-50">Today</button>
            <button onClick={nextDay} className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
          </div>
        </div>

        {/* List */}
        <div className="mt-4">
          {loading && <div className="p-4 text-gray-600">Loading appointments…</div>}
          {err && <div className="p-3 bg-red-100 text-red-700 rounded">{err}</div>}

          {!loading && appointments.length === 0 && !err && (
            <div className="p-4 text-gray-600">No confirmed appointments for this day.</div>
          )}

          <div className="mt-3 space-y-3">
            {appointments.map(appt => (
              <div key={appt._id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">
                    {appt.appointmentTypeId?.name ?? "Service"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Patient: {appt.patientId?.fullName ?? appt.patientId?.name ?? "Unknown"} • {formatTime(appt._start)}
                  </div>
                  {appt.notes && <div className="text-sm text-gray-500 mt-1">{appt.notes}</div>}
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-600">Duration: {(() => {
                    const dur = appt.appointmentTypeId?.durationMinutes ?? (appt.endTime && appt.startTime ? Math.round((new Date(appt.endTime)-new Date(appt.startTime))/60000) : "-");
                    return dur + " min";
                  })()}</div>

                  <div className="mt-2">
                    <Link to={`/appointments/${appt._id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* footer action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={goBackToDashboard}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
