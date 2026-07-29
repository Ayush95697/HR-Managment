import type { Role } from '../../types';

interface RoleBadgeProps {
  role: Role;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const getStyle = () => {
    switch (role) {
      case 'Admin':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger, #ef4444)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'HR':
        return { bg: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent, #3B82F6)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Employee':
      default:
        return { bg: 'rgba(16, 185, 129, 0.12)', color: 'var(--success, #10b981)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        letterSpacing: '0.02em',
      }}
    >
      {role}
    </span>
  );
}
