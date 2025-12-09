import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PatientDashboard from '../components/patient/PatientDashboard';
import StaffDashboard from '../components/staff/StaffDashboard';
import InventoryManagement from '../components/staff/InventoryManagement';
import SimpleInventory from '../components/staff/SimpleInventory';
import PatientRecordsManagement from '../components/staff/PatientRecordsManagement';
import StaffPatientRecords from '../components/staff/StaffPatientRecords';
import ProviderAvailability from '../components/staff/ProviderAvailability';
import AppointmentManagement from '../components/staff/AppointmentManagement';
import AppointmentStatusManagement from '../components/staff/AppointmentStatusManagement';
import BookAppointment from '../components/patient/BookAppointment';
import PatientRecordsView from '../components/patient/PatientRecordsView';
import PatientMedicalRecords from '../components/patient/PatientMedicalRecords';
import AppointmentsList from '../components/patient/AppointmentsList';
import UserManagement from '../components/staff/UserManagement';
import Reports from '../components/staff/Reports';
import AppointmentTypeManagement from '../components/staff/AppointmentTypeManagement';
import AllDentistAvailability from '../components/staff/AllDentistAvailability';
import SimpleBookAppointment from '../components/patient/SimpleBookAppointment';
import AdvancedBookAppointment from '../components/patient/AdvancedBookAppointment';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Render different components based on route
  const renderComponent = () => {
    switch (location.pathname) {
      case '/inventory':
        return <SimpleInventory />;
      case '/patients':
        return <StaffPatientRecords />;
      case '/availability':
        return <ProviderAvailability />;
      case '/appointments':
        return user?.role === 'DENTAL_STAFF' ? 
          <AppointmentManagement /> : 
          <AppointmentsList />;
      case '/book-appointment':
        return <BookAppointment />;
      case '/patient-records':
        return user?.role === 'DENTAL_STAFF' ? 
          <PatientRecordsManagement /> : 
          <PatientMedicalRecords />;
      case '/users':
        return <UserManagement />;
      case '/reports':
        return <Reports />;
      case '/appointment-types':
        return <AppointmentTypeManagement />;
      case '/all-availability':
        return <AllDentistAvailability />;
      default:
        return user?.role === 'DENTAL_STAFF' ? (
          <StaffDashboard />
        ) : (
          <PatientDashboard />
        );
    }
  };
  
  return (
    <div>
      {renderComponent()}
    </div>
  );
};

export default Dashboard;