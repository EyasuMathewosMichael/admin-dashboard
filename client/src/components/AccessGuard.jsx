import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AccessGuard — protects nested routes based on authentication and role.
 *
 * Usage (React Router v6 nested routes):
 *   <Route element={<AccessGuard allowedRoles={['admin']} />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 * Behaviour:
 *   - Not authenticated  → redirect to /login
 *   - Authenticated but role not in allowedRoles → redirect to /403
 *   - Authenticated and role allowed → render <Outlet />
 *
 * @param {{ allowedRoles?: string[] }} props
 */
export default function AccessGuard({ allowedRoles = ['admin'] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
