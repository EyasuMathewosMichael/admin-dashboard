import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import RegistrationTrendChart from '../components/charts/RegistrationTrendChart';
import RoleDistributionChart from '../components/charts/RoleDistributionChart';

// ---------------------------------------------------------------------------
// Skeleton placeholder — shown while data is loading
// ---------------------------------------------------------------------------
function Skeleton({ height = 160, borderRadius = 8 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        borderRadius,
        background: '#e5e7eb',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '1.25rem 1.5rem',
        flex: '1 1 0',
        minWidth: 160,
      }}
    >
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{label}</p>
      <p
        style={{
          margin: '0.25rem 0 0',
          fontSize: '2rem',
          fontWeight: 700,
          color: '#111827',
        }}
      >
        {value ?? '—'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, registrationsRes, rolesRes] = await Promise.all([
        axiosClient.get('/api/analytics/summary'),
        axiosClient.get('/api/analytics/registrations'),
        axiosClient.get('/api/analytics/roles'),
      ]);

      setSummary(summaryRes.data.data);
      setRegistrations(registrationsRes.data.data);
      setRoles(rolesRes.data.data);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.875rem', color: '#111827' }}>Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/users')}
              style={{
                background: '#ffffff',
                color: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Users
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            padding: '1rem 1.25rem',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={fetchData}
            style={{
              background: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '0.4rem 0.9rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Loading state — skeleton placeholders
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <main style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.875rem', color: '#111827' }}>Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/users')}
              style={{
                background: '#ffffff',
                color: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Users
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stat card skeletons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <Skeleton height={96} />
          <Skeleton height={96} />
          <Skeleton height={96} />
        </div>

        {/* Chart skeletons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Skeleton height={300} />
          <Skeleton height={300} />
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Loaded state
  // -------------------------------------------------------------------------
  return (
    <main style={{ padding: '2rem' }}>
      {/* Header with navigation and logout */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.875rem', color: '#111827' }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/users')}
            style={{
              background: '#ffffff',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ffffff';
            }}
          >
            Users
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc2626';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Total Users" value={summary?.totalUsers} />
        <StatCard label="Active Users" value={summary?.activeUsers} />
        <StatCard label="New (Last 30 Days)" value={summary?.newLast30Days} />
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Registration trend */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1.25rem',
          }}
        >
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#374151' }}>
            Registration Trend (Last 12 Months)
          </h2>
          <div style={{ height: 280 }}>
            <RegistrationTrendChart data={registrations} />
          </div>
        </section>

        {/* Role distribution */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1.25rem',
          }}
        >
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#374151' }}>
            Role Distribution
          </h2>
          <div style={{ height: 280 }}>
            <RoleDistributionChart data={roles} />
          </div>
        </section>
      </div>
    </main>
  );
}
