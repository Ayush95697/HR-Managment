import { useNavigate } from 'react-router-dom';
import { Kanban, Building2, Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBoards } from '../hooks/useBoards';
import { useUsers } from '../hooks/useUsers';
import { useDepartments } from '../hooks/useDepartments';
import { useAuthStore } from '../store/authStore';
import Spinner from '../components/shared/Spinner';
import RoleGate from '../components/shared/RoleGate';
import { TaskVelocityChart } from '../components/dashboard/TaskVelocityChart';
import { DepartmentDistributionChart } from '../components/dashboard/DepartmentDistributionChart';
import { WorkloadBalanceChart } from '../components/dashboard/WorkloadBalanceChart';
import { ActivityFeedTimeline } from '../components/dashboard/ActivityFeedTimeline';
import AnimatedNumber from '../components/shared/AnimatedNumber';
import { WaterfallContainer, WaterfallItem } from '../components/shared/Waterfall';
import Button from '../components/shared/Button';

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <WaterfallContainer className="flex flex-col gap-6">
      {/* Top Section: Organic Header Banner & Pill Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Greeting Card (Glassmorphism Antigravity) */}
        <WaterfallItem>
          <div className="glass-card-antigravity" style={{ padding: '36px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />
            
            {/* Decorative glowing orb */}
            <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, rgba(127,0,255,0.15) 50%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(20px)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                {greeting}, <span style={{ color: '#00FFFF', textShadow: '0 0 12px rgba(0, 255, 255, 0.6)' }}>{user?.name?.split(' ')[0]}</span>! <motion.span animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.5 }} style={{ display: 'inline-block', transformOrigin: '70% 70%' }}>👋</motion.span>
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: 'rgba(0, 255, 255, 0.15)', 
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  padding: '4px 12px', 
                  borderRadius: '999px', 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  color: '#00FFFF',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)'
                }}>
                  {user?.role}
                </span>
                <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
                  Your command center is ready. Manage boards, track performance, and oversee operations.
                </span>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <RoleGate roles={['Admin', 'HR']}>
                <Button 
                  onClick={() => navigate('/boards')} 
                  leftIcon={<Plus size={18} />}
                  className="btn-worktrail-interactive"
                  style={{ borderRadius: '999px', padding: '12px 28px' }}
                >
                  Create New Board
                </Button>
              </RoleGate>
            </div>
          </div>
        </WaterfallItem>

        {/* Stat Cards - Flowing Pills with Antigravity Glassmorphism */}
        <WaterfallItem>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass-card-antigravity" style={{ flex: '1 1 240px', padding: '10px 32px 10px 10px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'default' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 255, 255, 0.15)', border: '1px solid rgba(0, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00FFFF', flexShrink: 0, boxShadow: '0 0 12px rgba(0, 255, 255, 0.3)' }}>
                <Kanban size={26} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  <AnimatedNumber value={boards.length} />
                </span>
                <span style={{ fontSize: '0.75rem', color: '#A0A0B0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Boards</span>
              </div>
            </motion.div>

            <RoleGate roles={['Admin', 'HR']}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass-card-antigravity" style={{ flex: '1 1 240px', padding: '10px 32px 10px 10px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'default' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(127, 0, 255, 0.15)', border: '1px solid rgba(127, 0, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', flexShrink: 0, boxShadow: '0 0 12px rgba(127, 0, 255, 0.3)' }}>
                  <Users size={26} strokeWidth={2.5} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    <AnimatedNumber value={users.length} />
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#A0A0B0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Users</span>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass-card-antigravity" style={{ flex: '1 1 240px', padding: '10px 32px 10px 10px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'default' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 255, 255, 0.15)', border: '1px solid rgba(0, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00FFFF', flexShrink: 0, boxShadow: '0 0 12px rgba(0, 255, 255, 0.3)' }}>
                  <Building2 size={26} strokeWidth={2.5} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    <AnimatedNumber value={departments.length} />
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#A0A0B0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Departments</span>
                </div>
              </motion.div>
            </RoleGate>
          </div>
        </WaterfallItem>
      </div>

      {/* Analytics Grid Waterfall */}
      <WaterfallItem>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <TaskVelocityChart />
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <ActivityFeedTimeline />
          </div>
          
          {user?.role === 'Admin' && (
            <div style={{ gridColumn: 'span 1' }}>
              <DepartmentDistributionChart />
            </div>
          )}
          
          <div style={{ gridColumn: user?.role === 'Admin' ? 'span 2' : 'span 3' }}>
            <WorkloadBalanceChart />
          </div>
        </div>
      </WaterfallItem>
    </WaterfallContainer>
  );
}
