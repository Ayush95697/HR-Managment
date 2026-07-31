import { NavLink, useNavigate } from 'react-router-dom';
import { Kanban, Users, Building2, Mail, ShieldAlert, LayoutDashboard, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import RoleGate from '../shared/RoleGate';
import Logo from '../shared/Logo';
import { useProfile } from '../../hooks/useProfile';

export default function Sidebar() {
  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    borderRadius: '9999px',
    color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
    background: isActive 
      ? 'linear-gradient(135deg, var(--accent, #6366f1) 0%, #8b5cf6 100%)' 
      : 'transparent',
    border: isActive 
      ? '1px solid rgba(255, 255, 255, 0.2)' 
      : '1px solid transparent',
    boxShadow: isActive 
      ? '0 8px 24px rgba(99, 102, 241, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)' 
      : 'none',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.875rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--glass-bg, rgba(0, 0, 0, 0.4))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--glass-border, rgba(255, 255, 255, 0.05))',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
        }}
      >
        <Logo size="md" showText={true} />
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <RoleGate roles={['Admin', 'HR']}>
          <NavLink to="/" end style={linkStyle} className={({ isActive }) => `sidebar-item-glass ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        </RoleGate>

        <NavLink to="/boards" style={linkStyle} className={({ isActive }) => `sidebar-item-glass ${isActive ? 'active' : ''}`}>
          <Kanban size={18} />
          <span>Boards</span>
        </NavLink>

        {/* Admin-only Nav Item */}
        <RoleGate roles={['Admin']}>
          <NavLink to="/users" style={linkStyle} className={({ isActive }) => `sidebar-item-glass ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
        </RoleGate>

        {/* HR & Admin Nav Item */}
        <RoleGate roles={['Admin', 'HR']}>
          <NavLink to="/departments" style={linkStyle} className={({ isActive }) => `sidebar-item-glass ${isActive ? 'active' : ''}`}>
            <Building2 size={18} />
            <span>Departments</span>
          </NavLink>
          <NavLink to="/email" style={linkStyle} className={({ isActive }) => `sidebar-item-glass ${isActive ? 'active' : ''}`}>
            <Mail size={18} />
            <span>Email Center</span>
          </NavLink>
          <NavLink to="/audit" style={linkStyle} className={({ isActive }) => `sidebar-item-glass ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={18} />
            <span>Audit Logs</span>
          </NavLink>
        </RoleGate>

        {/* Settings — all roles */}
        <NavLink to="/settings" style={linkStyle} className={({ isActive }) => `sidebar-item-glass ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer User Info — click to go to settings */}
      <div
        onClick={() => navigate('/settings')}
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-hover, rgba(255,255,255,0.04))')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--accent, #6366f1)',
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            flexShrink: 0,
          }}
        >
          {profile?.avatarUrl 
            ? <img src={profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user?.name.charAt(0).toUpperCase() || 'U'
          }
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
            {user?.role}
          </div>
        </div>
      </div>
    </aside>
  );
}
