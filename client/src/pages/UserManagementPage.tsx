import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, UserCheck, UserX, Pencil } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser } from '../hooks/useUsers';
import { useDepartments } from '../hooks/useDepartments';
import { userSchema, type UserFormData } from '../types/schemas';
import type { User } from '../types';
import toast from 'react-hot-toast';
import RoleBadge from '../components/shared/RoleBadge';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Select from '../components/shared/Select';

export default function UserManagementPage() {
  const { data: users = [], isLoading } = useUsers();
  const { data: departments = [] } = useDepartments();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deactivateUserMutation = useDeactivateUser();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);
  const [activatingUser, setActivatingUser] = useState<User | null>(null);
  
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'Employee' },
  });

  const handleCreate = async (data: UserFormData) => {
    try {
      await createUserMutation.mutateAsync(data);
      setShowCreateModal(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleEdit = async (data: UserFormData) => {
    if (!editingUser) return;
    try {
      await updateUserMutation.mutateAsync({ 
        id: editingUser.id, 
        data: { ...data, isActive: editingUser.isActive } 
      });
      setEditingUser(null);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setValue('name', u.name);
    setValue('email', u.email);
    setValue('role', u.role);
    setValue('departmentId', u.departmentId || '');
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingUserId) return;
    try {
      await deactivateUserMutation.mutateAsync(deactivatingUserId);
      setDeactivatingUserId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate user');
    }
  };

  const handleActivateUser = (u: User) => {
    setActivatingUser(u);
  };

  const handleConfirmActivate = async () => {
    if (!activatingUser) return;
    try {
      await updateUserMutation.mutateAsync({
        id: activatingUser.id,
        data: {
          name: activatingUser.name,
          email: activatingUser.email,
          role: activatingUser.role,
          departmentId: activatingUser.departmentId || '',
          managerId: activatingUser.managerId || '',
          isActive: true
        }
      });
      setActivatingUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to activate user');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const roleMatch = selectedRole === 'All' || u.role === selectedRole;
    const deptMatch = selectedDepartment === 'All' || (selectedDepartment === 'Unassigned' ? !u.departmentId : u.departmentId === selectedDepartment);
    return roleMatch && deptMatch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            User Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Select 
            style={{ width: '150px' }} 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'Admin', label: 'Admin' },
              { value: 'HR', label: 'HR' },
              { value: 'Employee', label: 'Employee' }
            ]}
          />

          <Select 
            style={{ width: '200px' }} 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            options={[
              { value: 'All', label: 'All Departments' },
              { value: 'Unassigned', label: 'Unassigned' },
              ...departments.map(d => ({ value: d.id, label: d.name }))
            ]}
          />

          <Button leftIcon={<Plus size={16} />} onClick={() => { reset(); setShowCreateModal(true); }}>
            New User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Name & Email</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Department</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Manager</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <RoleBadge role={u.role} />
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                  {u.departmentName || 'Unassigned'}
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                  {u.role === 'Employee' 
                    ? (u.managerId ? users.find(x => x.id === u.managerId)?.name || 'Unknown' : 'Unassigned') 
                    : 'N/A'}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  {u.isActive ? (
                    <span style={{ color: 'var(--success)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserX size={14} /> Inactive
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" size="sm" onClick={() => openEdit(u)}>
                      <Pencil size={13} /> Edit
                    </Button>
                    {u.isActive ? (
                      <Button variant="danger" size="sm" onClick={() => setDeactivatingUserId(u.id)}>
                        Deactivate
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => handleActivateUser(u)}>
                        Activate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit(handleCreate)} isLoading={createUserMutation.isPending}>Create User</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input {...register('name')} className="form-input" placeholder="Jane Doe" autoFocus />
            {errors.name && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors.name.message}</span>}
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <input {...register('email')} type="email" className="form-input" placeholder="jane@company.com" />
            {errors.email && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors.email.message}</span>}
          </div>

          <div>
            <label className="form-label">Password</label>
            <input {...register('password')} type="password" className="form-input" placeholder="••••••••" />
            {errors.password && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors.password.message}</span>}
          </div>

          <div>
            <label className="form-label">Role</label>
            <Select 
              {...register('role')} 
              value={watch('role')}
              options={[
                { value: 'Employee', label: 'Employee' },
                { value: 'HR', label: 'HR' },
                { value: 'Admin', label: 'Admin' }
              ]} 
            />
          </div>

          <div>
            <label className="form-label">Department</label>
            <Select 
              {...register('departmentId')} 
              value={watch('departmentId')}
              options={[
                { value: '', label: 'Unassigned' },
                ...departments.map(d => ({ value: d.id, label: d.name }))
              ]} 
            />
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleSubmit(handleEdit)} isLoading={updateUserMutation.isPending}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleEdit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input {...register('name')} className="form-input" autoFocus />
            {errors.name && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors.name.message}</span>}
          </div>

          <div>
            <label className="form-label">Role</label>
            <Select 
              {...register('role')} 
              value={watch('role')}
              options={[
                { value: 'Employee', label: 'Employee' },
                { value: 'HR', label: 'HR' },
                { value: 'Admin', label: 'Admin' }
              ]} 
            />
          </div>

          <div>
            <label className="form-label">Department</label>
            <Select 
              {...register('departmentId')} 
              value={watch('departmentId')}
              options={[
                { value: '', label: 'Unassigned' },
                ...departments.map(d => ({ value: d.id, label: d.name }))
              ]} 
            />
          </div>
        </form>
      </Modal>

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingUserId}
        onClose={() => setDeactivatingUserId(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate User Account"
        message="Are you sure you want to deactivate this user? They will lose access immediately."
        isLoading={deactivateUserMutation.isPending}
      />

      {/* Confirm Activate Dialog */}
      <ConfirmDialog
        isOpen={!!activatingUser}
        onClose={() => setActivatingUser(null)}
        onConfirm={handleConfirmActivate}
        title="Activate User Account"
        message="Are you sure you want to activate this user? They will regain access immediately."
        isLoading={updateUserMutation.isPending}
      />
    </div>
  );
}
