// src/pages/Availability/AvailabilityForm.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AvailabilityForm() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const { id } = useParams(); // if editing: id is availability id
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({ dentalStaffId: "", weekday: 1, startTimeOfDay: "09:00", endTimeOfDay: "17:00" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // only clinic manager allowed to use this page
    if (user?.role !== "DENTAL_STAFF") {
      navigate(-1);
      return;
    }
    // load dentist list
    (async () => {
      try {
        const res = await axios.get("/users/providers");
        setProviders(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        // There is no direct GET /availability/byId, so we request dentist availability and find matching id
        // But simpler: backend has GET /availability/:dentalStaffId only. If you want GET by id add server route.
        // For now, attempt GET by listing providers and find block that matches id (we'll call a backend route /availability/by-id if available)
        const res = await axios.get(`/availability/${user.id}`); // fallback (may not find)
        const block = res.data.data.find(b => b._id === id);
        if (block) setForm({ dentalStaffId: block.dentalStaffId, weekday: block.weekday, startTimeOfDay: block.startTimeOfDay, endTimeOfDay: block.endTimeOfDay });
        else {
          // try to fetch by id directly if server supports: /availability/id
          try {
            const r2 = await axios.get(`/availability/by-id/${id}`);
            const b = r2.data.data;
            setForm({ dentalStaffId: b.dentalStaffId, weekday: b.weekday, startTimeOfDay: b.startTimeOfDay, endTimeOfDay: b.endTimeOfDay });
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    // basic validation
    if (!form.dentalStaffId) return setErr("Select dentist");
    if (!form.startTimeOfDay || !form.endTimeOfDay) return setErr("Provide start and end times");

    try {
      if (id) {
        await axios.put(`/availability/${id}`, form);
      } else {
        await axios.post(`/availability`, form);
      }
      navigate('/availability');
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">{id ? "Edit" : "New"} Availability</h1>

        {err && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Dentist</label>
            <select value={form.dentalStaffId} onChange={(e) => setForm({ ...form, dentalStaffId: e.target.value })} className="w-full border rounded px-3 py-2">
              <option value="">-- Select dentist --</option>
              {providers.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Weekday</label>
            <select value={form.weekday} onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })} className="w-full border rounded px-3 py-2">
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Start (HH:MM)</label>
              <input value={form.startTimeOfDay} onChange={(e) => setForm({ ...form, startTimeOfDay: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">End (HH:MM)</label>
              <input value={form.endTimeOfDay} onChange={(e) => setForm({ ...form, endTimeOfDay: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
