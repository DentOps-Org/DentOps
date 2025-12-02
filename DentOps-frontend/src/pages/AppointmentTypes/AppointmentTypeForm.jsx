// src/pages/AppointmentTypes/AppointmentTypeForm.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardRoute } from '../../utils/navigation'; // or define inline

import {
  createAppointmentType,
  updateAppointmentType,
  fetchAppointmentTypes,
} from "../../redux/slices/appointmentTypeSlice";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function AppointmentTypeForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const editingId = params.id;
  const { isLoading, error } = useSelector((s) => s.appointmentTypes);
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "",
    durationMinutes: 30,
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (editingId) {
      // load single appointment type
      (async () => {
        try {
          const res = await api.get(`/appointment-types/${editingId}`);
          const t = res.data.data;
          setForm({
            name: t.name || "",
            durationMinutes: t.durationMinutes || 30,
            description: t.description || "",
            isActive: t.isActive ?? true,
          });
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      durationMinutes: Number(form.durationMinutes),
      description: form.description,
      isActive: form.isActive,
    };
    if (editingId) {
      dispatch(updateAppointmentType(editingId, payload, navigate));
    } else {
      dispatch(createAppointmentType(payload, navigate));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        {editingId ? "Edit" : "New"} Appointment Type
      </h2>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Duration (minutes)</label>
          <input
            name="durationMinutes"
            type="number"
            value={form.durationMinutes}
            onChange={handleChange}
            min={15}
            max={300}
            required
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
          />
          <label htmlFor="isActive" className="text-gray-700">
            Active
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isLoading ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/appointment-types")}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
