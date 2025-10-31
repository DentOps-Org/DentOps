// src/pages/Dashboard/ManagerDashboard.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointmentTypes } from "../../redux/slices/appointmentTypeSlice";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { types, isLoading } = useSelector((s) => s.appointmentTypes);
  const count = types?.length || 0;

  useEffect(() => {
    dispatch(fetchAppointmentTypes());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Clinic Manager Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Appointment types card */}
          <div className="p-4 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Appointment Types</h2>
                <p className="text-sm text-gray-500">
                  Create and manage service durations
                </p>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {isLoading ? "..." : count}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                to="/appointment-types"
                className="flex-1 bg-gray-100 py-2 rounded text-center hover:bg-gray-200"
              >
                View All
              </Link>
              <button
                onClick={() => navigate("/appointment-types/new")}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                New Type
              </button>
            </div>
          </div>

          {/* Add other manager cards (availability, appointment requests, users) ... */}
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-semibold">Appointments</h3>
            <p className="text-sm text-gray-500">
              Assign requests, view calendar
            </p>
            <div className="mt-3">
              <Link
                to="/appointments"
                className="inline-block bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"
              >
                Open
              </Link>
            </div>
          </div>

          {/* <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-semibold">Staff Availability</h3>
            <p className="text-sm text-gray-500">Manage dentist schedules</p>
            <div className="mt-3">
              <Link
                to="/all-availability"
                className="inline-block bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"
              >
                Open
              </Link>
            </div>
          </div> */}

          <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <p className="text-sm text-gray-500">Manage stock, create items, adjust quantities.</p>

          <div className="mt-4 flex gap-2">
            <Link to="/inventory" className="flex-1 bg-gray-100 py-2 rounded text-center hover:bg-gray-200">
              View Inventory
            </Link>

            <Link to="/inventory/new" className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700">
              New Item
            </Link>
          </div>
        </div>

        {/* Availability card (NEW) */}
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-1">Dentist Availability</h2>
          <p className="text-sm text-gray-500">
            Create / edit dentist weekly working hours. Dentists can view their slots.
          </p>
          <Link to="/availability" className="inline-block mt-4 bg-blue-600 text-white px-3 py-2 rounded">Manage Availability</Link>
        </div>
        </div>
      </div>
    </div>
  );
}
