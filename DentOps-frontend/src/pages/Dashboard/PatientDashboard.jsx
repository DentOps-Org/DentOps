import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-4 text-blue-700">
          Patient Dashboard
        </h1>
        <p className="text-gray-600 text-center">
          Request appointments and view your records.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/appointment-types"
            className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
          >
            See Services & Durations
          </Link>
          <Link
            to="/book-appointment"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Request Appointment
          </Link>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">Request Appointment</h2>
            <p className="text-sm text-gray-500">Choose service and date to request an appointment.</p>
            <div className="mt-4">
              <Link to="/appointments/new" className="bg-blue-600 text-white px-3 py-2 rounded">Request</Link>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">My Appointments</h2>
            <p className="text-sm text-gray-500">View your requests and confirmed appointments.</p>
            <div className="mt-4">
              <Link to="/appointments/my" className="bg-blue-600 text-white px-3 py-2 rounded">Open</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
