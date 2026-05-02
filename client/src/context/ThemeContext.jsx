import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.body.style.background = dark ? '#0f172a' : '#f3f4f6';
    document.body.style.color = dark ? '#f1f5f9' : '#111827';
  }, [dark]);

  const toggle = () => setDark(d => !d);

  const t = {
    dark,
    toggle,
    bg: dark ? '#0f172a' : '#f3f4f6',
    surface: dark ? '#1e293b' : '#ffffff',
    surfaceAlt: dark ? '#334155' : '#f9fafb',
    border: dark ? '#334155' : '#e5e7eb',
    text: dark ? '#f1f5f9' : '#111827',
    textMuted: dark ? '#94a3b8' : '#6b7280',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    danger: '#dc2626',
    dangerHover: '#b91c1c',
    success: '#10b981',
    inputBg: dark ? '#1e293b' : '#ffffff',
    inputBorder: dark ? '#475569' : '#d1d5db',
    headerBg: dark ? '#1e293b' : '#ffffff',
    skeletonBg: dark ? '#334155' : '#e5e7eb',
  };

  return <ThemeContext.Provider value={t}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
