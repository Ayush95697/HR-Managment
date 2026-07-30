import { X, Mail, Building2, User } from 'lucide-react';
import type { SearchEmployeeDto } from '../../api/search.api';
import Modal from '../shared/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: SearchEmployeeDto | null;
}

export default function EmployeeModal({ isOpen, onClose, employee }: Props) {
  if (!employee) return null;

  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0 20px' }}>
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid var(--border)',
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0
          }}>
            {employee.avatarUrl 
              ? <img src={employee.avatarUrl} alt={employee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials || <User size={40} />
            }
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {employee.name}
            </h3>
            <span style={{
              display: 'inline-block',
              marginTop: '6px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {employee.role}
            </span>
            <span style={{
              display: 'inline-block',
              marginTop: '6px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: employee.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: employee.isActive ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginLeft: '8px'
            }}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'var(--surface-hover)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Mail size={16} />
            <a href={`mailto:${employee.email}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {employee.email}
            </a>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Building2 size={16} />
            <span>{employee.departmentName || 'No Department'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <User size={16} />
            <span>Manager: {employee.managerName || 'None'}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
