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
            <ProtectedRoute  allowedRoles={['DENTAL_STAFF']}>
              <InventoryForm />
            </ProtectedRoute>
          }
        />
        /* Edit - manager only */
        <Route
          path="/inventory/:id/edit"
          element={
            <ProtectedRoute  allowedRoles={['DENTAL_STAFF']}>
              <InventoryForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
