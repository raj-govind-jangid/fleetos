import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/common/LoadingSpinner';
import { AppLayout } from '../components/layout/AppLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import VehicleList from '../pages/vehicles/VehicleList';
import VehicleDetails from '../pages/vehicles/VehicleDetails';
import VehicleForm from '../pages/vehicles/VehicleForm';
import DriverList from '../pages/drivers/DriverList';
import DriverDetails from '../pages/drivers/DriverDetails';
import DriverForm from '../pages/drivers/DriverForm';
import TripList from '../pages/trips/TripList';
import TripDetails from '../pages/trips/TripDetails';
import TripForm from '../pages/trips/TripForm';
import FuelList from '../pages/fuel/FuelList';
import FuelCreate from '../pages/fuel/FuelCreate';
import MaintenanceList from '../pages/maintenance/MaintenanceList';
import MaintenanceCreate from '../pages/maintenance/MaintenanceCreate';
import ExpenseList from '../pages/expenses/ExpenseList';
import ExpenseCreate from '../pages/expenses/ExpenseCreate';
import DocumentList from '../pages/documents/DocumentList';
import DocumentCreate from '../pages/documents/DocumentCreate';
import AlertList from '../pages/alerts/AlertList';
import Reports from '../pages/reports/Reports';
import OrganizationSettings from '../pages/settings/OrganizationSettings';
import UserManagement from '../pages/settings/UserManagement';
import Profile from '../pages/settings/Profile';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/new" element={<VehicleForm />} />
          <Route path="vehicles/:id" element={<VehicleDetails />} />
          <Route path="vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="drivers" element={<DriverList />} />
          <Route path="drivers/new" element={<DriverForm />} />
          <Route path="drivers/:id" element={<DriverDetails />} />
          <Route path="drivers/:id/edit" element={<DriverForm />} />
          <Route path="trips" element={<TripList />} />
          <Route path="trips/new" element={<TripForm />} />
          <Route path="trips/:id" element={<TripDetails />} />
          <Route path="trips/:id/edit" element={<TripForm />} />
          <Route path="fuel" element={<FuelList />} />
          <Route path="fuel/new" element={<FuelCreate />} />
          <Route path="maintenance" element={<MaintenanceList />} />
          <Route path="maintenance/new" element={<MaintenanceCreate />} />
          <Route path="expenses" element={<ExpenseList />} />
          <Route path="expenses/new" element={<ExpenseCreate />} />
          <Route path="documents" element={<DocumentList />} />
          <Route path="documents/new" element={<DocumentCreate />} />
          <Route path="alerts" element={<AlertList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings/organization" element={<OrganizationSettings />} />
          <Route path="settings/users" element={<UserManagement />} />
          <Route path="settings/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
