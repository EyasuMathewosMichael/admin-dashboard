import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import NavBar from '../components/NavBar';
import { useTheme } from '../context/ThemeContext';
import RegistrationTrendChart from '../components/charts/RegistrationTrendChart';
import RoleDistributionChart from '../components/charts/RoleDistributionChart';

const DATE_RANGES = [
  { label: 'Last 7 days',  value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'All time',     value: 0 },
];

function Skeleton({ height = 160 }) {
  const t = useTheme();
  return (
    <div aria-hidden="true" style={{
      height, borderRadius: 8,
      background: t.skeletonBg,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );
}

function StatCard({ label, value, color }) {
  const t = useTheme();
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 10,
      padding: '1.25rem 1.5rem',
      flex: '1 1 0',
      minWidth: 160,
      borderTop: `3px solid ${color || t.primary}`,
    }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: t.textMuted, fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 700, color: t.text }}>
        {value ?? '—'}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTheme();
  const [summary, setSummary] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30);

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

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter registration data by date range
  const filteredRegistrations = (() => {
    if (!registrations || dateRange === 0) return registrations;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRange);
    return registrations.filter(r => new Date(r.month + '-01') >= cutoff);
  })();

  const pageStyle = { 
    minHeight: '100vh', 
    background: t.bg,
    display: 'flex',
    flexDirection: 'column',
  };
  const contentStyle = { 
    padding: '2rem', 
    maxWidth: 1200, 
    margin: '0 auto',
    flex: 1,
    width: '100%',
  };

  if (error) {
    return (
      <div style={pageStyle}>
        <NavBar />
        <div style={contentStyle}>
          <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700, color: t.text }}>Dashboard</h1>
          <div role="alert" style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '1rem 1.25rem', color: '#b91c1c',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={fetchData} style={{
              background: '#b91c1c', color: '#fff', border: 'none',
              borderRadius: 6, padding: '0.4rem 0.9rem', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
            }}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <NavBar />
        <div style={contentStyle}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Skeleton height={96} /><Skeleton height={96} /><Skeleton height={96} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <Skeleton height={300} /><Skeleton height={300} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <NavBar />
      <div style={contentStyle}>
        {/* Page heading + date range filter */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: t.text }}>Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  borderRadius: 6,
                  border: `1px solid ${dateRange === r.value ? t.primary : t.border}`,
                  background: dateRange === r.value ? t.primary : t.surface,
                  color: dateRange === r.value ? '#fff' : t.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard label="Total Users"         value={summary?.totalUsers}    color="#2563eb" />
          <StatCard label="Active Users"        value={summary?.activeUsers}   color="#10b981" />
          <StatCard label="New (Last 30 Days)"  value={summary?.newLast30Days} color="#f59e0b" />
        </div>

        {/* Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          <section style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: '1.25rem',
          }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: t.text }}>
              Registration Trend
            </h2>
            <div style={{ height: 280 }}>
              <RegistrationTrendChart data={filteredRegistrations} dark={t.dark} />
            </div>
          </section>

          <section style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: '1.25rem',
          }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: t.text }}>
              Role Distribution
            </h2>
            <div style={{ height: 280 }}>
              <RoleDistributionChart data={roles} dark={t.dark} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
