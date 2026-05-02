import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axiosClient from '../api/axiosClient';

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const t = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) navigate('/dashboard', { replace: true });
  }, [auth.isAuthenticated, navigate]);

  function validate() {
    const e = {};
    if (!email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (!password) e.password = 'Password is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await axiosClient.post('/api/auth/login', { email, password });
      auth.login(res.data.data.token);
      setTimeout(() => navigate('/dashboard', { replace: true }), 100);
    } catch (err) {
      if (err.response?.status === 401) {
        setServerError('Invalid email or password.');
      } else if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        setServerError('Unable to reach the server. Check your connection.');
      } else {
        setServerError(err.response?.data?.error?.message || 'Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = {
    padding: '0.5rem 0.75rem', fontSize: '1rem',
    border: `1px solid ${t.inputBorder}`, borderRadius: 4,
    background: t.inputBg, color: t.text, outline: 'none', width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '1rem', background: t.bg,
    }}>
      {/* Dark mode toggle in corner */}
      <button
        onClick={t.toggle}
        aria-label={t.dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed', top: '1rem', right: '1rem',
          width: 36, height: 36, borderRadius: 8,
          background: t.surface, border: `1px solid ${t.border}`,
          cursor: 'pointer', fontSize: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {t.dark ? '☀️' : '🌙'}
      </button>

      <div style={{
        width: '100%', maxWidth: 400,
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 10, padding: '2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700, color: t.text, textAlign: 'center' }}>
          Admin Login
        </h1>

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
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: t.text, marginBottom: '0.25rem' }}>
              Email address
            </label>
            <input
              id="email" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              style={{ ...inputStyle, ...(errors.email ? { borderColor: '#dc2626' } : {}) }}
              required
            />
            {errors.email && <span role="alert" style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{errors.email}</span>}
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: t.text, marginBottom: '0.25rem' }}>
              Password
            </label>
            <input
              id="password" type="password" autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              style={{ ...inputStyle, ...(errors.password ? { borderColor: '#dc2626' } : {}) }}
              required
            />
            {errors.password && <span role="alert" style={{ fontSize: '0.8125rem', color: '#dc2626' }}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.625rem 1rem', fontSize: '1rem', fontWeight: 600,
              color: '#fff', background: isSubmitting ? '#93c5fd' : t.primary,
              border: 'none', borderRadius: 4,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
