import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import RoleBadge from '../shared/RoleBadge';
import { authApi } from '../../api/auth.api';
import { useProfile } from '../../hooks/useProfile';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch full profile for avatar URL
  const { data: profile } = useProfile();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { }
    finally {
      queryClient.clear();
      logout();
      navigate('/login');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(9, 10, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0, 255, 255, 0.15)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Styled Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem', fontWeight: 800 }}>
          <span style={{ color: '#7F00FF', textShadow: '0 0 10px rgba(127, 0, 255, 0.7)' }}>Work</span>
          <span style={{ color: '#00FFFF', textShadow: '0 0 10px rgba(0, 255, 255, 0.7)' }}>Trail</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500, fontSize: '0.85rem', marginLeft: '3px' }}>Portal</span>
        </div>
        {user?.role && <RoleBadge role={user.role} />}
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <GlobalSearch />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-end' }}>
        <NotificationBell />
        {/* User menu */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: '9999px',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 255, 255, 0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
          >
            {/* Avatar */}
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden',
              background: 'linear-gradient(135deg, #7F00FF, #00FFFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.4)',
            }}>
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>

            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </span>
            <ChevronDown size={14} color="#00FFFF" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              minWidth: '190px', backgroundColor: 'rgba(9, 10, 20, 0.95)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 255, 255, 0.25)', borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.8), 0 0 20px rgba(0,255,255,0.2)',
              overflow: 'hidden', zIndex: 200,
            }}>
              <button
                type="button"
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                style={{
                  width: '100%', padding: '12px 16px', border: 'none', background: 'none',
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '10px', fontSize: '0.875rem', fontWeight: 500,
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 255, 255, 0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <Settings size={15} color="#00FFFF" />
                Settings
              </button>
              <div style={{ height: '1px', background: 'rgba(0, 255, 255, 0.12)', margin: '0 12px' }} />
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '12px 16px', border: 'none', background: 'none',
                  color: 'var(--danger)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '10px', fontSize: '0.875rem', fontWeight: 500,
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
