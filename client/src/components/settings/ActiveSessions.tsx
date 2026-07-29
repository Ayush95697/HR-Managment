import { Monitor, LogOut, Trash2 } from 'lucide-react';
import { useSessions, useRevokeSession, useRevokeAllOtherSessions } from '../../hooks/useProfile';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

function formatExpiresIn(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Expired';
  return `Expires in ${days} day${days > 1 ? 's' : ''}`;
}

export default function ActiveSessions() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAllOther = useRevokeAllOtherSessions();

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>;

  const otherSessions = sessions?.filter(s => !s.isCurrent) ?? [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Active Sessions
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {sessions?.length ?? 0} active session{(sessions?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {otherSessions.length > 0 && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={revokeAllOther.isPending}
            leftIcon={<LogOut size={14} />}
            onClick={() => revokeAllOther.mutate()}
          >
            Log out other devices
          </Button>
        )}
      </div>

      {!sessions?.length ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No active sessions found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map(session => (
            <div
              key={session.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--surface-2, #334155)',
                border: session.isCurrent
                  ? '1px solid rgba(59, 130, 246, 0.4)'
                  : '1px solid var(--border)',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: session.isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Monitor size={20} color={session.isCurrent ? 'var(--accent)' : 'var(--text-muted)'} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Browser Session
                    </span>
                    {session.isCurrent && (
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                        borderRadius: '20px', background: 'rgba(59, 130, 246, 0.2)',
                        color: 'var(--accent)', border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}>
                        This device
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Created {formatRelativeTime(session.createdAt)} · {formatExpiresIn(session.expiresAt)}
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() => revokeSession.mutate(session.id)}
                  disabled={revokeSession.isPending}
                  title="Revoke this session"
                  style={{
                    padding: '7px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
