import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import HomePage from './routes/HomePage';
import MyBookingsPage from './features/bookings/pages/MyBookingsPage';
import MyIncidents from './features/tickets/pages/MyIncidents';
import CreateIncident from './features/tickets/pages/CreateIncident';
import IncidentDetails from './features/tickets/pages/IncidentDetails';
import UpdateIncident from './features/tickets/pages/UpdateIncident';
import TicketList from './features/tickets/pages/TicketList';
import TechnicianManagement from './features/tickets/pages/TechnicianManagement';
import TechnicianDashboard from './features/tickets/pages/TechnicianDashboard';
import TechnicianTickets from './features/tickets/pages/TechnicianTickets';
import TechnicianTicketDetail from './features/tickets/pages/TechnicianTicketDetail';

import AvailabilityView from './features/resources/pages/AvailabilityView';
import ResourcesPage from './features/resources/pages/ResourcesPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import ResourceList from './features/resources/pages/ResourceList';
import ResourceForm from './features/resources/pages/ResourceForm';
import ResourceDetails from './features/resources/pages/ResourceDetails';
import AnalyticsDashboard from './features/bookings/pages/AnalyticsDashboard';
import AdminBookingApprovalPage from './features/bookings/pages/AdminBookingApprovalPage';
import { useAuth } from "./context/AuthContext";
// Dhanushka's pages (Auth + Notifications)
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Dashboard from "./features/auth/pages/Dashboard";
import UserManagement from "./features/auth/pages/UserManagement";
import Notifications from "./features/notifications/pages/Notifications";
import OAuthSuccess from "./features/auth/pages/OAuthSuccess";


function App() {

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <div className="grain-overlay" />
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/availability" element={<AvailabilityView />} />

          {/* Auth routes */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Booking routes */}
          <Route path="/bookings" element={<Navigate to="/resources" replace />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* My Incidents: Visibility for Users to view their reported incidents */}
          <Route path="/my-incidents" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <MyIncidents />
            </ProtectedRoute>
          } />

          {/* Create Incident: Report a new issue */}
          <Route path="/create" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <CreateIncident />
            </ProtectedRoute>
          } />

          {/* View Incident Details: User views their incident details and comments */}
          <Route path="/incident/:id" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <IncidentDetails />
            </ProtectedRoute>
          } />

          {/* Update/Manage Incident: Admin manages ticket status, assigns technician, adds notes */}
          <Route path="/update/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UpdateIncident />
            </ProtectedRoute>
          } />

          {/* Ticket List: Admin overview of reported incidents */}
          <Route path="/ticket-list" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/admin/tickets" replace />
            </ProtectedRoute>
          } />

          {/* Technician Management: Admin manages technician staff */}
          <Route path="/technician-management" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/admin/technicians" replace />
            </ProtectedRoute>
          } />

          {/* Technician Dashboard */}
          <Route path="/technician" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />
          <Route path="/technician/tickets" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianTickets />
            </ProtectedRoute>
          } />
          <Route path="/technician/ticket/:id" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianTicketDetail />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="resources" />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route
              path="tickets"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TicketList />
                </ProtectedRoute>
              }
            />
            <Route
              path="tickets/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UpdateIncident />
                </ProtectedRoute>
              }
            />
            <Route
              path="technicians"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TechnicianManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBookingApprovalPage />
                </ProtectedRoute>
              }
            />
            <Route path="resources" element={<ResourceList />} />
            <Route path="resources/add" element={<ResourceForm />} />
            <Route path="resources/edit/:id" element={<ResourceForm />} />
            <Route path="resources/view/:id" element={<ResourceDetails />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
