import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * NavBar — shared top navigation bar for all protected pages.
 * Handles dark mode toggle, navigation, and logout.
 * Includes hamburger menu for mobile screens.
 */
export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const t = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false); // Close menu after navigation
  };

  const navLink = (label, path, isMobile = false) => {
    const active = location.pathname.startsWith(path);
    return (
      <button
        onClick={() => handleNavClick(path)}
        style={{
          padding: isMobile ? '0.75rem 1rem' : '0.4rem 0.875rem',
          background: active ? t.primary : 'transparent',
          color: active ? '#fff' : t.textMuted,
          border: active ? 'none' : `1px solid ${t.border}`,
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: isMobile ? '1rem' : '0.875rem',
          transition: 'all 0.15s',
          width: isMobile ? '100%' : 'auto',
          textAlign: isMobile ? 'left' : 'center',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      {/* Global styles for responsive behavior */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .mobile-sidebar {
            display: flex !important;
          }
        }
      `}</style>

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

        {/* Desktop Nav links - hidden on mobile */}
        <nav 
          className="desktop-nav"
          style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center',
          }}
        >
          {navLink('Dashboard', '/dashboard')}
          {navLink('Users', '/users')}
        </nav>

        {/* Right side: hamburger (mobile) + dark mode + logout */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Hamburger menu button - visible only on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="hamburger-btn"
            style={{
              width: 36, 
              height: 36,
              display: 'none',
              alignItems: 'center', 
              justifyContent: 'center',
              background: t.surfaceAlt,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: 0,
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

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

      {/* Mobile sidebar menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
              display: 'none',
            }}
          />

          {/* Sidebar */}
          <aside
            className="mobile-sidebar"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '280px',
              height: '100vh',
              background: t.surface,
              borderRight: `1px solid ${t.border}`,
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 999,
              padding: '1.5rem',
              display: 'none',
              flexDirection: 'column',
              gap: '1rem',
              overflowY: 'auto',
            }}
          >
            {/* Sidebar header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: `1px solid ${t.border}`,
            }}>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: t.text }}>
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: t.textMuted,
                }}
              >
                ✕
              </button>
            </div>

            {/* Navigation links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navLink('Dashboard', '/dashboard', true)}
              {navLink('Users', '/users', true)}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
