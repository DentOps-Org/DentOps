import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Top navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">DentOps</h1>
        <nav className="space-x-4">
          <Link
            to="/login"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Register
          </Link>
        </nav>
      </header>

      {/* Hero section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-4">
        <div className="max-w-lg bg-white rounded-2xl shadow-lg p-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Simplify Your Dental Practice
          </h2>
          <p className="text-gray-600 mb-8">
            Manage appointments, staff, and patient records — all in one place.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} DentOps — All Rights Reserved
      </footer>
    </div>
  );
}
