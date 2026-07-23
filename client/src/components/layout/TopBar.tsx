import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import RoleBadge from '../shared/RoleBadge';
import { authApi } from '../../api/auth.api';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore cleanup error
    } finally {
      queryClient.clear();
      logout();
      navigate('/login');
    }
  };

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--surface, #1e293b)',
        borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          HR Management Portal
        </span>
        {user?.role && <RoleBadge role={user.role} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger, #ef4444)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md, 8px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
