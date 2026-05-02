import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NavBar from '../components/NavBar';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const t = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {isAuthenticated && <NavBar />}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '4rem 2rem', textAlign: 'center',
      }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '4rem', fontWeight: 800, color: t.danger }}>403</h1>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', fontWeight: 600, color: t.text }}>Access Denied</h2>
        <p style={{ margin: '0 0 1.5rem', color: t.textMuted, maxWidth: 360 }}>
          You don't have permission to view this page.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '0.625rem 1.5rem', background: t.primary, color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            fontWeight: 600, fontSize: '1rem',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
