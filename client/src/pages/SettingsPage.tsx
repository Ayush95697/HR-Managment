import { useState } from 'react';
import { User, Lock, Monitor } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import Spinner from '../components/shared/Spinner';
import ProfileSection from '../components/settings/ProfileSection';
import AvatarUploader from '../components/settings/AvatarUploader';
import NotificationPreferences from '../components/settings/NotificationPreferences';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import ActiveSessions from '../components/settings/ActiveSessions';

type Tab = 'profile' | 'security' | 'sessions';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',    label: 'Profile',    icon: <User size={16} /> },
  { id: 'security',   label: 'Security',   icon: <Lock size={16} /> },
  { id: 'sessions',   label: 'Sessions',   icon: <Monitor size={16} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { data: profile, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
        Failed to load profile. Please try refreshing.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Manage your profile, appearance, and security settings.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar tabs */}
        <nav style={{
          width: '200px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'sticky',
          top: '80px',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                backgroundColor: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div style={{
          flex: 1,
          minWidth: '300px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          {activeTab === 'profile' && (
            <>
              <AvatarUploader profile={profile} />
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <ProfileSection profile={profile} />
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <NotificationPreferences profile={profile} />
            </>
          )}
          {activeTab === 'security' && <ChangePasswordForm />}
          {activeTab === 'sessions' && <ActiveSessions />}
        </div>
      </div>
    </div>
  );
}
