import { NavLink } from 'react-router-dom';
import { Kanban, Users, Building2, Mail, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import RoleGate from '../shared/RoleGate';

export default function Sidebar() {
  const { user } = useAuthStore();

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: 'var(--radius-md, 8px)',
    color: isActive ? 'var(--accent-text, #ffffff)' : 'var(--text-secondary, #94a3b8)',
    backgroundColor: isActive ? 'var(--accent, #6366f1)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.875rem',
    transition: 'all 0.15s ease',
  });

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--surface, #1e293b)',
        borderRight: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
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
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
          }}
        >
          HR
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
          HR Flow
        </span>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <NavLink to="/" end style={linkStyle}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/boards" style={linkStyle}>
          <Kanban size={18} />
          <span>Boards</span>
        </NavLink>

        {/* Admin-only Nav Item */}
        <RoleGate roles={['Admin']}>
          <NavLink to="/users" style={linkStyle}>
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
        </RoleGate>

        {/* HR & Admin Nav Item */}
        <RoleGate roles={['Admin', 'HR']}>
          <NavLink to="/departments" style={linkStyle}>
            <Building2 size={18} />
            <span>Departments</span>
          </NavLink>
          <NavLink to="/email" style={linkStyle}>
            <Mail size={18} />
            <span>Email Center</span>
          </NavLink>
          <NavLink to="/audit" style={linkStyle}>
            <ShieldAlert size={18} />
            <span>Audit Logs</span>
          </NavLink>
        </RoleGate>
      </nav>

      {/* Footer User Info */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent, #6366f1)',
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
          }}
        >
          {user?.name.charAt(0).toUpperCase() || 'U'}
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
