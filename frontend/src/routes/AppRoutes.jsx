import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import ResourceListPage from "../pages/ResourceListPage";
import ResourceDetailPage from "../pages/ResourceDetailPage";
import BookingFormPage from "../pages/BookingFormPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import CreateTicketPage from "../pages/CreateTicketPage";
import MyTicketsPage from "../pages/MyTicketsPage";
import TicketDetailPage from "../pages/TicketDetailPage";
import AdminBookingApprovalPage from "../pages/AdminBookingApprovalPage";
import UserRoleManagementPage from "../pages/UserRoleManagementPage";
import TechnicianQueuePage from "../pages/TechnicianQueuePage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import { ROUTES } from "../constants/routes";

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      <Route path={ROUTES.RESOURCES} element={<ResourceListPage />} />
      <Route path={ROUTES.RESOURCE_DETAIL} element={<ResourceDetailPage />} />
      <Route path={ROUTES.BOOK_RESOURCE} element={<BookingFormPage />} />
      <Route path={ROUTES.MY_BOOKINGS} element={<MyBookingsPage />} />
      <Route path={ROUTES.CREATE_TICKET} element={<CreateTicketPage />} />
      <Route path={ROUTES.MY_TICKETS} element={<MyTicketsPage />} />
      <Route path={ROUTES.TICKET_DETAIL} element={<TicketDetailPage />} />
      <Route path={ROUTES.ADMIN_BOOKING_APPROVALS} element={<AdminBookingApprovalPage />} />
      <Route path={ROUTES.USER_ROLE_MANAGEMENT} element={<UserRoleManagementPage />} />
      <Route path={ROUTES.TECHNICIAN_QUEUE} element={<TechnicianQueuePage />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}

export default AppRoutes;
