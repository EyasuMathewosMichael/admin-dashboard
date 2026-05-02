import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import axiosClient from '../api/axiosClient';
import NavBar from '../components/NavBar';

export default function UserFormPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const t = useTheme();
  const toast = useToast();
  const { id } = useParams();
  const isEditMode = !!id;
  const isOwnProfile = id === currentUser?.sub;

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      axiosClient.get(`/api/users/${id}`)
        .then(res => {
          const user = res.data.data;
          setFormData({ name: user.name, email: user.email, password: '', role: user.role });
          setLoading(false);
        })
        .catch(err => {
          setServerError(err?.response?.data?.error?.message || 'Failed to load user.');
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  function validate() {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.role) newErrors.role = 'Role is required.';
    if (!isEditMode && !formData.password) newErrors.password = 'Password is required.';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      if (isEditMode) {
        const payload = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        await axiosClient.put(`/api/users/${id}`, payload);
        toast.add('User updated successfully.', 'success');
      } else {
        await axiosClient.post('/api/users', formData);
        toast.add('User created successfully.', 'success');
      }
      navigate('/users');
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ email: 'Email already in use.' });
      } else if (err.response?.status === 422) {
        setServerError(err.response.data.error.message);
      } else {
        setServerError(err?.response?.data?.error?.message || 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const pageStyle = { minHeight: '100vh', background: t.bg };
  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem',
    fontSize: '1rem', border: `1px solid ${t.inputBorder}`,
    borderRadius: 4, background: t.inputBg, color: t.text,
    outline: 'none', boxSizing: 'border-box',
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <NavBar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: 500, height: 300, background: t.skeletonBg, borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <NavBar />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          width: '100%', maxWidth: 500,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 10, padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.375rem', fontWeight: 700, color: t.text }}>
            {isEditMode ? (isOwnProfile ? 'My Profile' : 'Edit User') : 'Add User'}
          </h2>

          {serverError && (
            <div role="alert" style={{
              marginBottom: '1rem', padding: '0.75rem 1rem',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 4, fontSize: '0.875rem', color: '#b91c1c',
            }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: t.text, marginBottom: '0.25rem' }}>
                Name
              </label>
              <input
                id="name" type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                aria-invalid={!!errors.name}
                style={{ ...inputStyle, ...(errors.name ? { borderColor: '#dc2626' } : {}) }}
                required
              />
              {errors.name && <span role="alert" style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{errors.name}</span>}
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: t.text, marginBottom: '0.25rem' }}>
                Email
              </label>
              <input
                id="email" type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                aria-invalid={!!errors.email}
                style={{ ...inputStyle, ...(errors.email ? { borderColor: '#dc2626' } : {}) }}
                required
              />
              {errors.email && <span role="alert" style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{errors.email}</span>}
            </div>

            {/* Hide role selector when editing own profile */}
            {!isOwnProfile && (
              <div>
                <label htmlFor="role" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: t.text, marginBottom: '0.25rem' }}>
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <span role="alert" style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{errors.role}</span>}
              </div>
            )}

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: t.text, marginBottom: '0.25rem' }}>
                Password{' '}
                {isEditMode && <span style={{ fontWeight: 400, color: t.textMuted }}>(leave blank to keep current)</span>}
              </label>
              <input
                id="password" type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                aria-invalid={!!errors.password}
                style={{ ...inputStyle, ...(errors.password ? { borderColor: '#dc2626' } : {}) }}
                required={!isEditMode}
              />
              {errors.password && <span role="alert" style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => navigate('/users')}
                style={{
                  flex: 1, padding: '0.625rem 1rem', fontSize: '1rem', fontWeight: 600,
                  color: t.text, background: t.surfaceAlt,
                  border: `1px solid ${t.border}`, borderRadius: 4, cursor: 'pointer',
                }}
              >
                ← Back to Users
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1, padding: '0.625rem 1rem', fontSize: '1rem', fontWeight: 600,
                  color: '#fff', background: submitting ? '#93c5fd' : t.primary,
                  border: 'none', borderRadius: 4,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Saving…' : isEditMode ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
