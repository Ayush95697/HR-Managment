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
    borderRadius: isActive ? '0 9999px 9999px 0' : '9999px',
    color: isActive ? '#ffffff' : '#A0A0B0',
    background: isActive
      ? 'linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0%, transparent 100%)'
      : 'transparent',
    borderLeft: isActive ? '3px solid #00FFFF' : '3px solid transparent',
    boxShadow: isActive ? '-5px 0px 15px rgba(0, 255, 255, 0.5)' : 'none',
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.875rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'rgba(9, 10, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(0, 255, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid rgba(0, 255, 255, 0.12)',
        }}
      >
        <Logo size="md" showText={true} showTagline={true} />
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '16px 12px 16px 0', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
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

      {/* Footer User Info */}
      <div
        onClick={() => navigate('/settings')}
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(0, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 255, 255, 0.05)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #7F00FF 0%, #00FFFF 100%)',
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(127, 0, 255, 0.6)',
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
          <div style={{ fontSize: '0.75rem', color: '#00FFFF', opacity: 0.8 }}>
            {user?.role}
          </div>
        </div>
      </div>
    </aside>
  );
}
