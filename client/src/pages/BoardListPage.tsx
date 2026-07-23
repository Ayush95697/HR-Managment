import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Kanban, Search, ArrowRight, Layers } from 'lucide-react';
import { useBoards, useCreateBoard } from '../hooks/useBoards';
import { useAuthStore } from '../store/authStore';
import { useDepartments } from '../hooks/useDepartments';
import { boardSchema, type BoardFormData } from '../types/schemas';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Modal from '../components/shared/Modal';
import RoleGate from '../components/shared/RoleGate';

export default function BoardListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { user } = useAuthStore();
  const { data: boards = [], isLoading } = useBoards();
  const { data: departments = [] } = useDepartments();
  const createBoardMutation = useCreateBoard();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
  });

  const handleCreate = async (data: BoardFormData) => {
    try {
      const newBoard = await createBoardMutation.mutateAsync(data);
      setShowModal(false);
      reset();
      navigate(`/boards/${newBoard.id}`);
    } catch {
      // Error handled by query
    }
  };

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.departmentName && b.departmentName.toLowerCase().includes(search.toLowerCase()))
  );

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
            Work Boards
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {boards.length} board{boards.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <RoleGate roles={['Admin', 'HR']}>
          <Button leftIcon={<Plus size={16} />} onClick={() => {
            reset();
            if (user?.role === 'HR' && user?.departmentId) {
              setValue('departmentId', user.departmentId);
            }
            setShowModal(true);
          }}>
            New Board
          </Button>
        </RoleGate>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '360px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '38px' }}
          placeholder="Search boards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Kanban size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No boards found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Try adjusting your search criteria or create a new board.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredBoards.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/boards/${b.id}`)}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Kanban size={18} />
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                {b.name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Department: {b.departmentName || 'General'}
              </p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span><Layers size={13} style={{ verticalAlign: 'middle' }} /> {b.columnCount || 0} columns</span>
                <span>{b.cardCount || 0} tasks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Board Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Board"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit(handleCreate)} isLoading={createBoardMutation.isPending}>Create Board</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Board Name</label>
            <input {...register('name')} className="form-input" placeholder="e.g. Q3 Onboarding Portal" autoFocus />
            {errors.name && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors.name.message}</span>}
          </div>

          {user?.role === 'Admin' ? (
            <div>
              <label className="form-label">Department</label>
              <select {...register('departmentId')} className="form-select">
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.departmentId && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors.departmentId.message}</span>}
            </div>
          ) : (
            <div>
              <label className="form-label">Department</label>
              <input 
                className="form-input" 
                disabled 
                value={departments.find(d => d.id === user?.departmentId)?.name || 'Your Department'} 
              />
              <input type="hidden" {...register('departmentId')} />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
