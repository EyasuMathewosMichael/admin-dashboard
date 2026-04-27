import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ForbiddenPage — displayed when a user lacks the required role for a route.
 */
export default function ForbiddenPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  return (
    <main style={styles.main}>
      {/* Header with navigation */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        <div style={styles.headerButtons}>
          <button
            onClick={() => navigate('/dashboard')}
            style={styles.navButton}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/users')}
            style={styles.navButton}
          >
            Users
          </button>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Forbidden message card */}
      <div style={styles.card}>
        <h2 style={styles.heading}>403 Forbidden</h2>
        <p style={styles.text}>You do not have permission to view this page.</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={styles.link}
        >
          ← Go to Dashboard
        </button>
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
  card: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  heading: {
    margin: '0 0 1rem',
    fontSize: '2rem',
    fontWeight: 700,
    color: '#dc2626',
  },
  text: {
    margin: '0 0 1.5rem',
    fontSize: '1rem',
    color: '#6b7280',
  },
  link: {
    display: 'inline-block',
    padding: '0.625rem 1.25rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.15s',
  },
};
