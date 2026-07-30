import { Mail, Building2, User } from 'lucide-react';
import type { SearchEmployeeDto } from '../../api/search.api';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: SearchEmployeeDto | null;
}

export default function EmployeeModal({ isOpen, onClose, employee }: Props) {
  if (!employee) return null;

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Profile Details"
      footer={
        <Button variant="secondary" onClick={onClose} style={{ borderRadius: '9999px', padding: '8px 24px' }}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Profile Avatar & Name Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 0',
          }}
        >
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #00FFFF',
              boxShadow: '0 0 16px rgba(0, 255, 255, 0.4)',
              background: 'linear-gradient(135deg, #7F00FF, #00FFFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {employee.avatarUrl ? (
              <img src={employee.avatarUrl} alt={employee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials || <User size={32} />
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {employee.name}
            </h3>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(127, 0, 255, 0.15)',
                  border: '1px solid rgba(127, 0, 255, 0.4)',
                  color: '#a855f7',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {employee.role}
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: employee.isActive ? 'rgba(0, 255, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: employee.isActive ? '1px solid rgba(0, 255, 255, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  color: employee.isActive ? '#00FFFF' : '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {employee.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: 'rgba(9, 10, 20, 0.7)',
            borderRadius: '14px',
            border: '1px solid rgba(0, 255, 255, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            <Mail size={16} color="#00FFFF" />
            <a href={`mailto:${employee.email}`} style={{ color: '#00FFFF', textDecoration: 'none', fontWeight: 500 }}>
              {employee.email}
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            <Building2 size={16} color="#7F00FF" />
            <span>
              <strong style={{ color: 'var(--text-muted)' }}>Department:</strong> {employee.departmentName || 'Human Resources'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            <User size={16} color="#00FFFF" />
            <span>
              <strong style={{ color: 'var(--text-muted)' }}>Manager:</strong> {employee.managerName || 'None'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
