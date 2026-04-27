import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function UserListPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user: currentUser } = useAuth();

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(`/api/users?page=${page}&pageSize=20`);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosClient.delete(`/api/users/${id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err?.response?.data?.error?.message || 'Failed to delete user.');
    }
  }

  if (loading) {
    return <main style={styles.main}><p>Loading...</p></main>;
  }

  if (error) {
    return (
      <main style={styles.main}>
        <div style={styles.topHeader}>
          <h1 style={styles.pageTitle}>Users</h1>
          <div style={styles.headerButtons}>
            <button onClick={() => navigate('/dashboard')} style={styles.dashboardBtn}>
              Dashboard
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
        <div role="alert" style={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => fetchUsers(pagination.page)} style={styles.retryBtn}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      {/* Header with navigation and logout */}
      <div style={styles.topHeader}>
        <h1 style={styles.pageTitle}>Users</h1>
        <div style={styles.headerButtons}>
          <button onClick={() => navigate('/dashboard')} style={styles.dashboardBtn}>
            Dashboard
          </button>
          <button onClick={() => navigate('/users/new')} style={styles.addBtn}>
            + Add User
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Table section */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={styles.tr}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...(u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser) }}>
                    {u.role}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: u.isActive ? '#10b981' : '#ef4444' }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => navigate(`/users/${u._id}/edit`)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    disabled={currentUser?.sub === u._id}
                    style={{
                      ...styles.deleteBtn,
                      ...(currentUser?.sub === u._id ? styles.disabledBtn : {}),
                    }}
                    title={currentUser?.sub === u._id ? 'Cannot delete your own account' : 'Delete user'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#6b7280' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button
          onClick={() => fetchUsers(pagination.page - 1)}
          disabled={pagination.page <= 1}
          style={{ ...styles.pageBtn, ...(pagination.page <= 1 ? styles.disabledBtn : {}) }}
        >
          Previous
        </button>
        <span style={styles.pageInfo}>
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
        </span>
        <button
          onClick={() => fetchUsers(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          style={{ ...styles.pageBtn, ...(pagination.page >= pagination.totalPages ? styles.disabledBtn : {}) }}
        >
          Next
        </button>
      </div>
    </main>
  );
}

const styles = {
  main: { padding: '2rem', maxWidth: 1100, margin: '0 auto' },
  topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' },
  pageTitle: { margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#111827' },
  headerButtons: { display: 'flex', gap: '1rem', alignItems: 'center' },
  dashboardBtn: { padding: '0.5rem 1rem', background: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.15s' },
  addBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'background-color 0.15s' },
  logoutButton: { padding: '0.5rem 1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'background-color 0.15s' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#374151' },
  badge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600 },
  badgeAdmin: { background: '#dbeafe', color: '#1d4ed8' },
  badgeUser: { background: '#d1fae5', color: '#065f46' },
  editBtn: { marginRight: '0.5rem', padding: '0.3rem 0.75rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '0.875rem' },
  deleteBtn: { padding: '0.3rem 0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 4, cursor: 'pointer', fontSize: '0.875rem' },
  disabledBtn: { opacity: 0.4, cursor: 'not-allowed' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem 1.25rem', color: '#b91c1c' },
  retryBtn: { background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  pagination: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' },
  pageBtn: { padding: '0.4rem 0.9rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontWeight: 500 },
  pageInfo: { fontSize: '0.9rem', color: '#6b7280' },
};
