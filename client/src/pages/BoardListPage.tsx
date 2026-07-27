import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Kanban, Search, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBoards, useCreateBoard } from '../hooks/useBoards';
import { useAuthStore } from '../store/authStore';
import { useDepartments } from '../hooks/useDepartments';
import { boardSchema, type BoardFormData } from '../types/schemas';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Modal from '../components/shared/Modal';
import RoleGate from '../components/shared/RoleGate';
import Select from '../components/shared/Select';
import { WaterfallContainer, WaterfallItem } from '../components/shared/Waterfall';

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
    watch,
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <WaterfallContainer staggerDelay={0.08}>
      {user?.role === 'Employee' ? (
        /* Header Banner - Organic Shape with Glassmorphism & Animated Borders */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative group mb-8"
        >
          {/* Traveling light beam effect container */}
          <div 
            className="absolute -inset-[1px] overflow-hidden pointer-events-none"
            style={{ borderRadius: '24px 80px 24px 24px' }}
          >
            <motion.div className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" } }} />
            <motion.div className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }} />
            <motion.div className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }} />
            <motion.div className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }} />
            <motion.div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }} />
            <motion.div className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }} />
            <motion.div className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }} />
            <motion.div className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }} />
          </div>

          {/* Actual Card Content */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px 80px 24px 24px',
              padding: '40px 48px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />
          
          {/* Decorative glowing orb */}
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(20px)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}
            >
              {greeting}, <span style={{ color: '#818cf8' }}>{user?.name?.split(' ')[0]}</span>! <motion.span animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.5 }} style={{ display: 'inline-block', transformOrigin: '70% 70%' }}>👋</motion.span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
            >
              <span style={{ 
                background: 'rgba(99, 102, 241, 0.15)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '4px 12px', 
                borderRadius: '999px', 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: '#a5b4fc',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {user?.role}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5 }}>
                Here are all the boards you have access to. Stay on top of your tasks.
              </span>
            </motion.div>
          </div>
          </div>
        </motion.div>
      ) : (
        /* Standard Header for Admin and HR */
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Boards
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Manage all projects, task workflows, and team assignments.
            </p>
          </div>
          <RoleGate roles={['Admin', 'HR']}>
            <Button
              onClick={() => {
                reset();
                if (user?.role === 'HR' && user?.departmentId) {
                  setValue('departmentId', user.departmentId);
                }
                setShowModal(true);
              }}
              leftIcon={<Plus size={16} />}
              style={{ borderRadius: '9999px' }}
            >
              New Board
            </Button>
          </RoleGate>
        </div>
      )}

      {/* Search Input */}
      <WaterfallItem>
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
      </WaterfallItem>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <WaterfallItem>
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Kanban size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No boards found</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Try adjusting your search criteria or create a new board.</p>
          </div>
        </WaterfallItem>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredBoards.map((b) => (
            <WaterfallItem key={b.id}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/boards/${b.id}`)}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
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
              </motion.div>
            </WaterfallItem>
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
              <Select 
                {...register('departmentId')}
                value={watch('departmentId')}
                options={[
                  { value: '', label: 'Select Department' },
                  ...departments.map(d => ({ value: d.id, label: d.name }))
                ]}
              />
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
    </WaterfallContainer>
  );
}
