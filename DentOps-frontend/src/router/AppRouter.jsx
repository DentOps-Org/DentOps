// src/router/AppRouter.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import PatientDashboard from "../pages/Dashboard/PatientDashboard";
import DentistDashboard from "../pages/Dashboard/DentistDashboard";
import ManagerDashboard from "../pages/Dashboard/ManagerDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import AppointmentTypeForm from "../pages/AppointmentTypes/AppointmentTypeForm";
import AppointmentTypeList from "../pages/AppointmentTypes/AppointmentTypeList";
import InventoryList from "../pages/Inventory/InventoryList";
import InventoryForm from "../pages/Inventory/InventoryForm";
import AvailabilityManagerPage from "../pages/Availability/AvailabilityManagerPage";
import AvailabilityForm from "../pages/Availability/AvailabilityForm";
import DentistAvailabilityPage from "../pages/Availability/DentistAvailabilityPage";
import BookAppointment from "../pages/Appointments/BookAppointment";
import PatientAppointments from "../pages/Appointments/PatientAppointments";
import ManagerRequests from "../pages/Appointments/ManagerRequests";
import DentistAppointments from "../pages/Appointments/DentistAppointments";
import CreatePatientRecord from "../pages/Records/CreatePatientRecord";
import PatientRecordsList from "../pages/Records/PatientRecordsList";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* protected dashboards */}
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/dentist"
          element={
            <ProtectedRoute
              allowedRoles={[
                { role: "DENTAL_STAFF", specializations: ["DENTIST"] },
              ]}
            >
              <DentistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute
              allowedRoles={[
                { role: "DENTAL_STAFF", specializations: ["CLINIC_MANAGER"] },
              ]}
            >
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        // public to authenticated users
        <Route
          path="/appointment-types"
          element={
            <ProtectedRoute>
              <AppointmentTypeList />
            </ProtectedRoute>
          }
        />
        // manager-only pages
        <Route
          path="/appointment-types/new"
          element={
            <ProtectedRoute
              allowedRoles={[
                { role: "DENTAL_STAFF", specializations: ["CLINIC_MANAGER"] },
              ]}
            >
              <AppointmentTypeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment-types/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={[
                { role: "DENTAL_STAFF", specializations: ["CLINIC_MANAGER"] },
              ]}
            >
              <AppointmentTypeForm />
            </ProtectedRoute>
          }
        />
        // optional: view single type (accessible to authenticated)
        <Route
          path="/appointment-types/:id"
          element={
            <ProtectedRoute>
              <AppointmentTypeForm />{" "}
              {/* reuse form in read-only or edit mode; or create a View component */}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
        /* Inventory list - dental staff only */
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={[{ role: "DENTAL_STAFF" }]}>
              <InventoryList />
            </ProtectedRoute>
          }
        />
        /* Create - manager only */
        <Route
          path="/inventory/new"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <InventoryForm />
            </ProtectedRoute>
          }
        />
        /* Edit - manager only */
        <Route
          path="/inventory/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <InventoryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/availability"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <AvailabilityManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/availability/new"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <AvailabilityForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/availability/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <AvailabilityForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/availability/me"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <DentistAvailabilityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/requests"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <ManagerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/my"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/dentist"
          element={
            <ProtectedRoute allowedRoles={[{role: "DENTAL_STAFF", specializations: ["DENTIST"]}]}>
              <DentistAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <PatientRecordsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/records/new"
          element={
            <ProtectedRoute allowedRoles={["DENTAL_STAFF"]}>
              <CreatePatientRecord />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
