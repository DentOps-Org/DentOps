import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function DentistDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-4 text-blue-700">
          Dentist Dashboard
        </h1>
        <p className="text-gray-600 text-center">
          Manage your schedule and patient records.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/appointment-types"
            className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
          >
            View Appointment Types
          </Link>
          <Link
            to="/appointments"
            className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
          >
            My Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}
