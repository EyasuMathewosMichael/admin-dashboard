import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * NavBar — shared top navigation bar for all protected pages.
 * Handles dark mode toggle, navigation, and logout.
 */
export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const t = useTheme();

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const navLink = (label, path) => {
    const active = location.pathname.startsWith(path);
    return (
      <button
        onClick={() => navigate(path)}
        style={{
          padding: '0.4rem 0.875rem',
          background: active ? t.primary : 'transparent',
          color: active ? '#fff' : t.textMuted,
          border: active ? 'none' : `1px solid ${t.border}`,
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.15s',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      background: t.headerBg,
      borderBottom: `1px solid ${t.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <span style={{ fontWeight: 700, fontSize: '1.125rem', color: t.text }}>
        Admin Dashboard
      </span>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {navLink('Dashboard', '/dashboard')}
        {navLink('Users', '/users')}
      </nav>

      {/* Right side: dark mode + logout */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {/* Dark mode toggle */}
        <button
          onClick={t.toggle}
          aria-label={t.dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={t.dark ? 'Light mode' : 'Dark mode'}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {t.dark ? '☀️' : '🌙'}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: '0.4rem 0.875rem',
            background: t.danger,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
