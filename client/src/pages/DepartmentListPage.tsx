import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Building2, Trash2 } from 'lucide-react';
import { useDepartments, useCreateDepartment, useDeleteDepartment } from '../hooks/useDepartments';
import { useUsers } from '../hooks/useUsers';
import { departmentSchema, type DepartmentFormData } from '../types/schemas';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Modal from '../components/shared/Modal';
import RoleGate from '../components/shared/RoleGate';
import RoleBadge from '../components/shared/RoleBadge';

export default function DepartmentListPage() {
  const { data: departments = [], isLoading } = useDepartments();
  const { data: users = [] } = useUsers();
  const createDeptMutation = useCreateDepartment();
  const deleteDeptMutation = useDeleteDepartment();
  const [showModal, setShowModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const queryId = searchParams.get('selectedId');
    if (queryId) {
      setSelectedDeptId(queryId);
      // Clean up the URL after setting state so it doesn't persist if they close and refresh
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, setSearchParams]);

  const getActiveStaff = (deptId: string) => {
    return users.filter(u => u.departmentId === deptId && u.isActive);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  const handleCreate = async (data: DepartmentFormData) => {
    try {
      await createDeptMutation.mutateAsync(data);
      setShowModal(false);
      reset();
    } catch {
      // Handled by hook
    }
  };

  const handleDelete = async () => {
    if (deptToDelete) {
      try {
        await deleteDeptMutation.mutateAsync(deptToDelete.id);
        setDeptToDelete(null);
      } catch {
        // Handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Departments
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {departments.length} department{departments.length !== 1 ? 's' : ''} configured
          </p>
        </div>

        <RoleGate roles={['Admin']}>
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            New Department
          </Button>
        </RoleGate>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {departments.map((dept) => (
          <div
            key={dept.id}
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {dept.name}
                </h3>
              </div>
              <RoleGate roles={['Admin']}>
                <button
                  onClick={() => setDeptToDelete({ id: dept.id, name: dept.name })}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                  title="Delete Department"
                >
                  <Trash2 size={18} />
                </button>
              </RoleGate>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Active Staff: <strong>{dept.activeUserCount ?? getActiveStaff(dept.id).length}</strong> employees
            </div>
            <div style={{ marginTop: '16px' }}>
              <Button variant="secondary" size="sm" onClick={() => setSelectedDeptId(dept.id)}>
                View Employees
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* New Department Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Department"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit(handleCreate)} isLoading={createDeptMutation.isPending}>Add Department</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleCreate)}>
          <label className="form-label">Department Name</label>
          <input {...register('name')} className="form-input" placeholder="e.g. Human Resources" autoFocus />
          {errors.name && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors.name.message}</span>}
        </form>
      </Modal>

      {/* View Employees Modal */}
      <Modal
        isOpen={!!selectedDeptId}
        onClose={() => setSelectedDeptId(null)}
        title={`Active Employees - ${departments.find(d => d.id === selectedDeptId)?.name}`}
        footer={<Button onClick={() => setSelectedDeptId(null)}>Close</Button>}
      >
        {selectedDeptId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {getActiveStaff(selectedDeptId).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active employees found in this department.</p>
            ) : (
              getActiveStaff(selectedDeptId).map(u => (
                <div key={u.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deptToDelete}
        onClose={() => setDeptToDelete(null)}
        title="Delete Department"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeptToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteDeptMutation.isPending}>Delete</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Are you sure you want to delete the <strong>{deptToDelete?.name}</strong> department? 
          This will unassign all users from this department and permanently delete all associated boards and tasks. 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
