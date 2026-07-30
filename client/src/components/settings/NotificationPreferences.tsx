import { Bell } from 'lucide-react';
import type { UserProfile } from '../../api/profile.api';
import { useUpdateProfile } from '../../hooks/useProfile';

interface Props {
  profile: UserProfile;
}

export default function NotificationPreferences({ profile }: Props) {
  const updateProfile = useUpdateProfile();

  const handleToggle = async () => {
    await updateProfile.mutateAsync({
      name: profile.name,
      themePreference: profile.themePreference,
      emailNotificationsEnabled: !profile.emailNotificationsEnabled,
    });
  };

  const enabled = profile.emailNotificationsEnabled;

  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Notifications
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Control when and how you receive email notifications.
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-2, #334155)',
        border: '1px solid var(--border)',
        maxWidth: '480px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: enabled ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={20} color={enabled ? 'var(--accent)' : 'var(--text-muted)'} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Email Notifications
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Receive emails for task assignments and updates
            </div>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={updateProfile.isPending}
          style={{
            width: '48px', height: '26px',
            borderRadius: '13px',
            border: 'none',
            cursor: 'pointer',
            padding: '3px',
            backgroundColor: enabled ? 'var(--accent)' : 'var(--border-strong)',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          aria-checked={enabled}
          role="switch"
        >
          <span style={{
            width: '20px', height: '20px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transform: enabled ? 'translateX(22px)' : 'translateX(0)',
            transition: 'transform 0.2s',
            display: 'block',
          }} />
        </button>
      </div>
    </div>
  );
}
