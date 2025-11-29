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
  const [assignState, setAssignState] = useState({}); // { [reqId]: { dentalStaffId, startTime, availability, existingAppts, workingHours } }

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

  const handleAssignChange = async (reqId, field, value) => {
    setAssignState(prev => ({ ...prev, [reqId]: { ...(prev[reqId]||{}), [field]: value } }));
    
    // When dentist or datetime changes, fetch availability and existing appointments
    const state = assignState[reqId] || {};
    const dentalStaffId = field === 'dentalStaffId' ? value : state.dentalStaffId;
    const startTime = field === 'startTime' ? value : state.startTime;
    
    if (dentalStaffId && startTime) {
      // Extract date from datetime-local value (YYYY-MM-DDTHH:MM)
      const selectedDate = startTime.split('T')[0]; // Get YYYY-MM-DD part
      await fetchAvailabilityInfo(reqId, dentalStaffId, selectedDate);
    }
  };

  const fetchAvailabilityInfo = async (reqId, dentalStaffId, date) => {
    try {
      // Get day of week from selected date
      const selectedDateObj = new Date(date);
      const weekday = selectedDateObj.getDay();
      
      // Fetch availability blocks for this dentist
      const availBlockRes = await axios.get(`/availability/${dentalStaffId}`);
      const allBlocks = availBlockRes.data?.data || [];
      
      // Find the block for the selected weekday
      const availabilityBlock = allBlocks.find(block => block.weekday === weekday);
      
      // Fetch available slots
      const availRes = await axios.get(`/appointments/available`, {
        params: {
          dentalStaffId,
          date,
          durationMinutes: 30 // default duration
        }
      });

      // Fetch existing appointments for that dentist on that date
      const appointmentsRes = await axios.get(`/appointments`, {
        params: {
          dentalStaffId,
          status: 'CONFIRMED'
        }
      });

      // Filter appointments for the selected date
      const existingAppts = (appointmentsRes.data?.data || []).filter(appt => {
        const apptDate = new Date(appt.startTime);
        return apptDate.toDateString() === selectedDateObj.toDateString();
      });

      const isAvailable = (availRes.data?.data || []).length > 0;

      setAssignState(prev => ({
        ...prev,
        [reqId]: {
          ...(prev[reqId] || {}),
          availability: isAvailable,
          existingAppts: existingAppts,
          availableSlots: availRes.data?.data || [],
          workingHours: availabilityBlock || null // Store working hours for selected day
        }
      }));
    } catch (e) {
      console.error('Error fetching availability:', e);
      setAssignState(prev => ({
        ...prev,
        [reqId]: {
          ...(prev[reqId] || {}),
          availability: null,
          existingAppts: [],
          availableSlots: [],
          workingHours: null
        }
      }));
    }
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

  const handleDelete = async (reqId) => {
    if (!window.confirm('Are you sure you want to delete this appointment request?')) {
      return;
    }

    try {
      await axios.delete(`/appointments/${reqId}`);
      // Remove from list
      setRequests(prev => prev.filter(r => r._id !== reqId));
      alert('Request deleted successfully');
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to delete request');
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
          {requests.map(r => {
            const state = assignState[r._id] || {};
            
            return (
              <div key={r._id} className="p-4 border rounded flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <div className="font-semibold">{r.appointmentTypeId?.name || "Service"}</div>
                    <div className="text-sm text-gray-600">Patient: {r.patientId?.fullName || r.patientId?.email}</div>
                    <div className="text-sm text-gray-600">Phone: {r.patientId?.phone || "N/A"}</div>
                    <div className="text-sm text-gray-600">Requested Date: {new Date(r.requestedDate).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">Notes: {r.notes || "—"}</div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-80">
                    <select
                      value={state.dentalStaffId || ""}
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
                      value={state.startTime || ""}
                      onChange={(e) => handleAssignChange(r._id, "startTime", e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />

                    <div className="flex gap-2">
                      <button 
                        onClick={() => submitAssign(r._id)} 
                        disabled={state.availability === false}
                        className={`px-3 py-2 rounded ${
                          state.availability === false 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title={state.availability === false ? "Dentist is not available on this day" : ""}
                      >
                        Assign & Confirm
                      </button>
                      <button onClick={() => handleDelete(r._id)} className="px-3 py-2 border border-red-500 text-red-600 hover:bg-red-50 rounded">Delete</button>
                    </div>
                  </div>
                </div>

                {/* Availability Info Section */}
                {state.dentalStaffId && state.startTime && (
                  <div className="mt-3 pt-3 border-t">
                    {state.availability === null && (
                      <div className="text-sm text-gray-500">Loading availability...</div>
                    )}
                    
                    {state.availability === false && (
                      <div className="text-sm text-red-600 font-medium">
                        ❌ Dentist is NOT available on this day
                      </div>
                    )}
                    
                    {state.availability === true && (
                      <div>
                        <div className="text-sm text-green-600 font-medium mb-2">
                          ✅ Dentist is available on this day
                        </div>
                        
                        {/* Display Working Hours */}
                        {state.workingHours && (
                          <div className="text-sm text-gray-700 mb-2 bg-blue-50 px-2 py-1 rounded">
                            <span className="font-medium">Working Hours:</span> {state.workingHours.startTimeOfDay} - {state.workingHours.endTimeOfDay}
                          </div>
                        )}
                        
                        {state.existingAppts && state.existingAppts.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Existing Appointments ({state.existingAppts.length}):
                            </div>
                            <div className="space-y-1">
                              {state.existingAppts.map((appt, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                  {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                                  {appt.patientId?.fullName && ` (${appt.patientId.fullName})`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {state.existingAppts && state.existingAppts.length === 0 && (
                          <div className="text-sm text-gray-600">
                            No appointments scheduled for this day yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
