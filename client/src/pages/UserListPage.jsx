import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';
import ConfirmModal from '../components/ConfirmModal';

// Coloured circle with user initials
function Avatar({ name }) {
  const colors = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#dc2626'];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: '50%',
      background: colors[idx], color: '#fff',
      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </span>
  );
}

export default function UserListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const t = useTheme();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Bulk selection
  const [selected, setSelected] = useState(new Set());

  // Delete confirm modal
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name } | 'bulk'

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(`/api/users?page=${page}&pageSize=20`);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
      setSelected(new Set());
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  // Client-side filtering
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = !roleFilter   || u.role === roleFilter;
    const matchStatus = !statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  // Delete single user
  async function handleDelete(id) {
    try {
      await axiosClient.delete(`/api/users/${id}`);
      toast.add('User deleted successfully.', 'success');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.add(err?.response?.data?.error?.message || 'Failed to delete user.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  }

  // Bulk delete
  async function handleBulkDelete() {
    const ids = [...selected].filter(id => id !== currentUser?.sub);
    try {
      await Promise.all(ids.map(id => axiosClient.delete(`/api/users/${id}`)));
      toast.add(`${ids.length} user(s) deleted.`, 'success');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.add('Some deletions failed.', 'error');
      fetchUsers(pagination.page);
    } finally {
      setConfirmDelete(null);
    }
  }

  // Toggle active status inline
  async function handleToggleActive(user) {
    try {
      await axiosClient.put(`/api/users/${user._id}`, { isActive: !user.isActive });
      toast.add(`${user.name} marked as ${!user.isActive ? 'active' : 'inactive'}.`, 'success');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.add('Failed to update status.', 'error');
    }
  }

  // Export CSV
  function handleExportCSV() {
    const header = ['Name', 'Email', 'Role', 'Status', 'Created'];
    const rows = filtered.map(u => [
      u.name, u.email, u.role,
      u.isActive ? 'Active' : 'Inactive',
      new Date(u.createdAt).toLocaleDateString(),
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.add('Users exported to CSV.', 'success');
  }

  // Select all visible (non-self)
  const selectableIds = filtered.filter(u => u._id !== currentUser?.sub).map(u => u._id);
  const allSelected = selectableIds.length > 0 && selectableIds.every(id => selected.has(id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableIds));
    }
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const pageStyle = { minHeight: '100vh', background: t.bg };
  const contentStyle = { padding: '2rem', maxWidth: 1200, margin: '0 auto' };

  if (loading) {
    return (
      <div style={pageStyle}>
        <NavBar />
        <div style={contentStyle}>
          <div style={{ height: 40, background: t.skeletonBg, borderRadius: 8, marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 300, background: t.skeletonBg, borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <NavBar />
        <div style={contentStyle}>
          <div role="alert" style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '1rem 1.25rem', color: '#b91c1c',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => fetchUsers(1)} style={{
              background: '#b91c1c', color: '#fff', border: 'none',
              borderRadius: 6, padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600,
            }}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <NavBar />
      <div style={contentStyle}>

        {/* Page heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: t.text }}>Users</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleExportCSV} style={{
              padding: '0.5rem 1rem', background: t.surface, color: t.text,
              border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
            }}>
              Export CSV
            </button>
            <button onClick={() => navigate('/users/new')} style={{
              padding: '0.5rem 1rem', background: t.primary, color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
            }}>
              + Add User
            </button>
          </div>
        </div>

        {/* Search & filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search users"
            style={{
              flex: '1 1 200px', padding: '0.5rem 0.75rem',
              border: `1px solid ${t.inputBorder}`, borderRadius: 6,
              background: t.inputBg, color: t.text, fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            style={{
              padding: '0.5rem 0.75rem', border: `1px solid ${t.inputBorder}`,
              borderRadius: 6, background: t.inputBg, color: t.text,
              fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            style={{
              padding: '0.5rem 0.75rem', border: `1px solid ${t.inputBorder}`,
              borderRadius: 6, background: t.inputBg, color: t.text,
              fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.625rem 1rem', marginBottom: '0.75rem',
            background: t.primary + '18', border: `1px solid ${t.primary}40`,
            borderRadius: 8,
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: t.primary }}>
              {selected.size} selected
            </span>
            <button
              onClick={() => setConfirmDelete('bulk')}
              style={{
                padding: '0.35rem 0.875rem', background: t.danger, color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8125rem',
              }}
            >
              Delete selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              style={{
                padding: '0.35rem 0.875rem', background: 'transparent', color: t.textMuted,
                border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8125rem',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${t.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: t.surface }}>
            <thead>
              <tr>
                <th style={{ ...th(t), width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all users"
                  />
                </th>
                <th style={th(t)}>User</th>
                <th style={th(t)}>Role</th>
                <th style={th(t)}>Status</th>
                <th style={th(t)}>Created</th>
                <th style={th(t)}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={td(t)}>
                    {u._id !== currentUser?.sub && (
                      <input
                        type="checkbox"
                        checked={selected.has(u._id)}
                        onChange={() => toggleSelect(u._id)}
                        aria-label={`Select ${u.name}`}
                      />
                    )}
                  </td>
                  <td style={td(t)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <Avatar name={u.name} />
                      <div>
                        <div style={{ fontWeight: 600, color: t.text, fontSize: '0.9375rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: t.textMuted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td(t)}>
                    <span style={{
                      display: 'inline-block', padding: '0.2rem 0.6rem',
                      borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600,
                      ...(u.role === 'admin'
                        ? { background: '#dbeafe', color: '#1d4ed8' }
                        : { background: '#d1fae5', color: '#065f46' }),
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={td(t)}>
                    {/* Inline active/inactive toggle */}
                    <button
                      onClick={() => handleToggleActive(u)}
                      title={`Click to mark as ${u.isActive ? 'inactive' : 'active'}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.2rem 0.6rem', borderRadius: 9999,
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        border: 'none',
                        ...(u.isActive
                          ? { background: '#d1fae5', color: '#065f46' }
                          : { background: '#fee2e2', color: '#b91c1c' }),
                      }}
                    >
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: u.isActive ? '#10b981' : '#ef4444',
                        display: 'inline-block',
                      }} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ ...td(t), color: t.textMuted, fontSize: '0.8125rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={td(t)}>
                    <button
                      onClick={() => navigate(`/users/${u._id}/edit`)}
                      style={{
                        marginRight: '0.5rem', padding: '0.3rem 0.75rem',
                        background: t.surfaceAlt, border: `1px solid ${t.border}`,
                        borderRadius: 4, cursor: 'pointer', fontSize: '0.875rem',
                        color: t.text,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: u._id, name: u.name })}
                      disabled={currentUser?.sub === u._id}
                      title={currentUser?.sub === u._id ? 'Cannot delete your own account' : 'Delete user'}
                      style={{
                        padding: '0.3rem 0.75rem',
                        background: '#fef2f2', border: '1px solid #fca5a5',
                        color: '#b91c1c', borderRadius: 4, cursor: 'pointer',
                        fontSize: '0.875rem',
                        ...(currentUser?.sub === u._id ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...td(t), textAlign: 'center', color: t.textMuted, padding: '2rem' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', justifyContent: 'center' }}>
          <button
            onClick={() => fetchUsers(pagination.page - 1)}
            disabled={pagination.page <= 1}
            style={{
              padding: '0.4rem 0.9rem', background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 6,
              cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
              opacity: pagination.page <= 1 ? 0.4 : 1,
              fontWeight: 500, color: t.text,
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.9rem', color: t.textMuted }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            onClick={() => fetchUsers(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            style={{
              padding: '0.4rem 0.9rem', background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 6,
              cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
              opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
              fontWeight: 500, color: t.text,
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete single confirm */}
      <ConfirmModal
        open={!!confirmDelete && confirmDelete !== 'bulk'}
        title="Delete user"
        message={confirmDelete && confirmDelete !== 'bulk'
          ? `Are you sure you want to delete "${confirmDelete.name}"? This cannot be undone.`
          : ''}
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Bulk delete confirm */}
      <ConfirmModal
        open={confirmDelete === 'bulk'}
        title="Delete selected users"
        message={`Are you sure you want to delete ${selected.size} user(s)? This cannot be undone.`}
        confirmLabel={`Delete ${selected.size} user(s)`}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

// Style helpers
const th = (t) => ({
  padding: '0.75rem 1rem', textAlign: 'left',
  fontSize: '0.75rem', fontWeight: 600, color: t.textMuted,
  background: t.surfaceAlt, borderBottom: `1px solid ${t.border}`,
  textTransform: 'uppercase', letterSpacing: '0.05em',
});

const td = (t) => ({
  padding: '0.875rem 1rem', fontSize: '0.9375rem', color: t.text,
});
