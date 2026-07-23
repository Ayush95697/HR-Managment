import { useNavigate } from 'react-router-dom';
import { Kanban, Building2, Users, ArrowRight, Plus } from 'lucide-react';
import { useBoards } from '../hooks/useBoards';
import { useUsers } from '../hooks/useUsers';
import { useDepartments } from '../hooks/useDepartments';
import { useAuthStore } from '../store/authStore';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import RoleGate from '../components/shared/RoleGate';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: boards = [], isLoading: boardsLoading } = useBoards();
  const { data: users = [] } = useUsers();
  const { data: departments = [] } = useDepartments();

  if (boardsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-xl, 12px)',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Role: <strong>{user?.role}</strong> · Manage your organization's boards, tasks, and communications.
          </p>
        </div>

        <RoleGate roles={['Admin', 'HR']}>
          <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/boards')}>
            View All Boards
          </Button>
        </RoleGate>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Boards</span>
            <Kanban size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{boards.length}</div>
        </div>

        <RoleGate roles={['Admin', 'HR']}>
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Users</span>
              <Users size={20} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{users.length}</div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Departments</span>
              <Building2 size={20} style={{ color: 'var(--warning)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{departments.length}</div>
          </div>
        </RoleGate>
      </div>

      {/* Recent Boards Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Recent Work Boards
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {boards.slice(0, 6).map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/boards/${board.id}`)}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {board.name}
                </h3>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Department: {board.departmentName || 'General'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
