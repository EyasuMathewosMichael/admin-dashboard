import { Routes, Route, Navigate } from 'react-router-dom';
import AccessGuard from './components/AccessGuard';
import LoginPage from './pages/LoginPage';
import ForbiddenPage from './pages/ForbiddenPage';
import DashboardPage from './pages/DashboardPage';
import UserListPage from './pages/UserListPage';
import UserFormPage from './pages/UserFormPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403"   element={<ForbiddenPage />} />

      {/* Admin-only routes */}
      <Route element={<AccessGuard allowedRoles={['admin']} />}>
        <Route path="/dashboard"        element={<DashboardPage />} />
        <Route path="/users"            element={<UserListPage />} />
        <Route path="/users/new"        element={<UserFormPage />} />
        <Route path="/users/:id/edit"   element={<UserFormPage />} />
        <Route path="/profile"          element={<UserFormPage />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
