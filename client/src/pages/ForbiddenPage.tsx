import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/shared/Button';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--danger, #ef4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <ShieldAlert size={38} />
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        403 — Access Forbidden
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.5 }}>
        You do not have permission to view this resource. Your current role does not grant access to this feature.
      </p>
      <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
    </div>
  );
}
