// src/pages/AppointmentTypes/AppointmentTypeList.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointmentTypes,
  deleteAppointmentType,
} from "../../redux/slices/appointmentTypeSlice";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardRoute } from "../../utils/navigation"; // or define inline

export default function AppointmentTypeList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { types, isLoading, error } = useSelector((s) => s.appointmentTypes);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchAppointmentTypes());
  }, [dispatch]);

  const onDelete = (id) => {
    if (
      !window.confirm(
        "Delete this appointment type? This is permanent if not in use."
      )
    )
      return;
    dispatch(deleteAppointmentType(id));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Appointment Types</h1>
        {/* {user && user.role === "DENTAL_STAFF" && user.specialization === "CLINIC_MANAGER" && (
          <button
            onClick={() => navigate("/appointment-types/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Type
          </button>
        )} */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(getDashboardRoute(user))}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200"
          >
            ← Back to Dashboard
          </button>

          {user?.role === "DENTAL_STAFF" &&
            user?.specialization === "CLINIC_MANAGER" && (
              <button
                onClick={() => navigate("/appointment-types/new")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + New Type
              </button>
            )}
        </div>
      </div>

      {isLoading && <div className="text-gray-600">Loading...</div>}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {types.length === 0 ? (
        <div className="text-gray-600">No appointment types found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Duration (min)</th>
                <th className="py-2">Active</th>
                <th className="py-2">Description</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 border-b">
                  <td className="py-2">{t.name}</td>
                  <td className="py-2">{t.durationMinutes}</td>
                  <td className="py-2">{t.isActive ? "Yes" : "No"}</td>
                  <td className="py-2 text-sm text-gray-600">
                    {t.description || "—"}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/appointment-types/${t._id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </Link>

                      {user &&
                        user.role === "DENTAL_STAFF" &&
                        user.specialization === "CLINIC_MANAGER" && (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/appointment-types/${t._id}/edit`)
                              }
                              className="text-sm text-indigo-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(t._id)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
