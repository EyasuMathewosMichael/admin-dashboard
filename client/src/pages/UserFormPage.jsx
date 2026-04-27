import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function UserFormPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

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
      } else {
        await axiosClient.post('/api/users', formData);
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

  if (loading) {
    return (
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <div style={styles.headerButtons}>
            <button onClick={() => navigate('/dashboard')} style={styles.navButton}>
              Dashboard
            </button>
            <button onClick={() => navigate('/users')} style={styles.navButton}>
              Users
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
        <div style={styles.container}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      {/* Header with navigation */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        <div style={styles.headerButtons}>
          <button onClick={() => navigate('/dashboard')} style={styles.navButton}>
            Dashboard
          </button>
          <button onClick={() => navigate('/users')} style={styles.navButton}>
            Users
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Form container */}
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>{isEditMode ? 'Edit User' : 'Add User'}</h2>

          {serverError && (
            <div role="alert" style={styles.serverError}>{serverError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            <div style={styles.fieldGroup}>
              <label htmlFor="name" style={styles.label}>Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-invalid={!!errors.name}
                style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
                required
              />
              {errors.name && <span role="alert" style={styles.fieldError}>{errors.name}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-invalid={!!errors.email}
                style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                required
              />
              {errors.email && <span role="alert" style={styles.fieldError}>{errors.email}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="role" style={styles.label}>Role</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                aria-invalid={!!errors.role}
                style={{ ...styles.input, ...(errors.role ? styles.inputError : {}) }}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <span role="alert" style={styles.fieldError}>{errors.role}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>
                Password {isEditMode && <span style={{ fontWeight: 400, color: '#6b7280' }}>(leave blank to keep current)</span>}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                aria-invalid={!!errors.password}
                style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
                required={!isEditMode}
              />
              {errors.password && <span role="alert" style={styles.fieldError}>{errors.password}</span>}
            </div>

            <div style={styles.actions}>
              <button type="button" onClick={() => navigate('/users')} style={styles.cancelBtn}>
                ← Back to Users
              </button>
              <button type="submit" disabled={submitting} style={{ ...styles.submitBtn, ...(submitting ? styles.disabledBtn : {}) }}>
                {submitting ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
  },
  headerButtons: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  navButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#2563eb',
    backgroundColor: '#ffffff',
    border: '1px solid #2563eb',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    padding: '2rem',
  },
  heading: {
    margin: '0 0 1.5rem',
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#111827',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: 4,
    outline: 'none',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  fieldError: {
    fontSize: '0.8125rem',
    color: '#dc2626',
  },
  serverError: {
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 4,
    fontSize: '0.875rem',
    color: '#b91c1c',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.625rem 1rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 4,
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '0.625rem 1rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  disabledBtn: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed',
  },
};
