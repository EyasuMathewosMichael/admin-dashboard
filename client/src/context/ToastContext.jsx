import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  const t = useTheme();
  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 9999,
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} t={t} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove, t }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const colors = {
    success: { bg: '#10b981', icon: '✓' },
    error:   { bg: '#dc2626', icon: '✕' },
    info:    { bg: '#2563eb', icon: 'i' },
  };
  const { bg, icon } = colors[toast.type] || colors.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderLeft: `4px solid ${bg}`,
        borderRadius: 8,
        padding: '0.75rem 1rem',
        minWidth: 280,
        maxWidth: 380,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: '50%',
        background: bg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
      }}>
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: '0.875rem', color: t.text }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: t.textMuted, fontSize: '1rem', padding: '0 0.25rem',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
