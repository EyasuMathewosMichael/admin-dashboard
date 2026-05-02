import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ConfirmModal — replaces window.confirm() with a proper dialog.
 *
 * Props:
 *   open     — boolean, whether the modal is visible
 *   title    — string, modal heading
 *   message  — string, body text
 *   onConfirm — () => void, called when user clicks the confirm button
 *   onCancel  — () => void, called when user clicks cancel or presses Escape
 *   confirmLabel — string (default "Delete")
 *   danger   — boolean (default true), makes confirm button red
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  danger = true,
}) {
  const t = useTheme();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: '1.5rem',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <h2 id="modal-title" style={{
          margin: '0 0 0.5rem',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: t.text,
        }}>
          {title}
        </h2>
        {message && (
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.9375rem', color: t.textMuted }}>
            {message}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1.25rem',
              background: t.surfaceAlt,
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: t.text,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: '0.5rem 1.25rem',
              background: danger ? t.danger : t.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
