import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  onDismiss?: () => void;
}

export default function ErrorBanner({ title = 'Error', message, fieldErrors, onDismiss }: ErrorBannerProps) {
  if (!message && !fieldErrors) return null;

  return (
    <div
      style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: 'var(--danger, #ef4444)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md, 8px)',
        marginBottom: '16px',
        fontSize: '0.875rem',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</div>
        <div>{message}</div>
        {fieldErrors && Object.keys(fieldErrors).length > 0 && (
          <ul style={{ marginTop: '6px', paddingLeft: '20px', fontSize: '0.8125rem' }}>
            {Object.entries(fieldErrors).map(([field, errs]) => (
              <li key={field}>
                <strong>{field}:</strong> {errs.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
