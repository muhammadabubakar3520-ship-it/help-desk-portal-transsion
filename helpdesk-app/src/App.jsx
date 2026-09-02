import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import RoleRoute from './layouts/RoleRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CreateTicket from './pages/CreateTicket.jsx'
import MyTickets from './pages/MyTickets.jsx'
import Admin from './pages/Admin.jsx'
import TicketApproval from './pages/TicketApproval.jsx'
import DepartmentRequests from './pages/DepartmentRequests.jsx'
import Reports from './pages/Reports.jsx'
import UserManagement from './pages/UserManagement.jsx'
import AssetManagement from './pages/AssetManagement.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { ROLES } from './utils/constants'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-ticket" element={<CreateTicket />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/ticket-approval" element={<TicketApproval />} />
          <Route path="/department-requests" element={<DepartmentRequests />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/assets" element={<AssetManagement />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
