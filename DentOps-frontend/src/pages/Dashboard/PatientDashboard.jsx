import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-4 text-blue-700">
          Patient Dashboard
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Request appointments and view your records.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Request Appointment Card */}
          <div className="p-5 border rounded-lg hover:shadow-md transition">
            <h2 className="text-lg font-semibold mb-2">Request Appointment</h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose service and date to request an appointment.
            </p>
            <Link
              to="/appointments/new"
              className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Request
            </Link>
          </div>

          {/* My Appointments Card */}
          <div className="p-5 border rounded-lg hover:shadow-md transition">
            <h2 className="text-lg font-semibold mb-2">My Appointments</h2>
            <p className="text-sm text-gray-500 mb-4">
              View your requests, confirmed and completed appointments.
            </p>
            <Link
              to="/appointments/my"
              className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View All
            </Link>
          </div>

          {/* My Records Card */}
          <div className="p-5 border rounded-lg hover:shadow-md transition">
            <h2 className="text-lg font-semibold mb-2">My Records</h2>
            <p className="text-sm text-gray-500 mb-4">
              View medical records and notes created by your dentist.
            </p>
            <Link
              to="/records"
              className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Records
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-3">
            <Link
              to="/appointment-types"
              className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 text-sm"
            >
              See Services & Durations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
