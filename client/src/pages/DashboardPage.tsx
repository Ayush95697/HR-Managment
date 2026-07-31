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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Header Banner - Organic Shape with Glassmorphism & Animated Borders */}
        <WaterfallItem>
          <div className="relative group">
            {/* Traveling light beam effect container */}
            <div 
              className="absolute -inset-[1px] overflow-hidden pointer-events-none"
              style={{ borderRadius: '24px 80px 24px 24px' }}
            >
              <motion.div className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" } }} />
              <motion.div className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }} />
              <motion.div className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }} />
              <motion.div className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }} />
            </div>

            {/* Actual Card Content */}
            <div
              style={{
                background: 'var(--hero-bg, rgba(0, 0, 0, 0.4))',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--hero-border, rgba(255, 255, 255, 0.05))',
                borderRadius: '24px 80px 24px 24px',
                padding: '40px 48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--hero-shadow, 0 20px 40px -12px rgba(0, 0, 0, 0.5))',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Subtle noise texture */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />
              
              {/* Decorative glowing orb */}
              <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(20px)' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                  {greeting}, <span style={{ color: '#818cf8' }}>{user?.name?.split(' ')[0]}</span>! <motion.span animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.5 }} style={{ display: 'inline-block', transformOrigin: '70% 70%' }}>👋</motion.span>
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-muted, rgba(255, 255, 255, 0.6))', lineHeight: 1.5 }}>
                    Your command center is ready. Manage boards, track performance, and oversee operations.
                  </span>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <RoleGate roles={['Admin', 'HR']}>
                  <Button 
                    onClick={() => navigate('/boards')} 
                    leftIcon={<Plus size={18} />}
                    style={{ borderRadius: '999px', padding: '12px 28px' }}
                  >
                    Create New Board
                  </Button>
                </RoleGate>
              </div>
            </div>
          </div>
        </WaterfallItem>

        {/* Stat Cards - Flowing Pills */}
        <WaterfallItem>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <motion.div whileHover={{ y: -4, scale: 1.02 }} style={{ position: 'relative', flex: '1 1 240px', background: 'var(--surface)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '999px', padding: '10px 32px 10px 10px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3)', cursor: 'default' }} className="glass-card-hover">
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
                <Kanban size={26} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  <AnimatedNumber value={boards.length} />
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Boards</span>
              </div>
            </motion.div>

            <RoleGate roles={['Admin', 'HR']}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} style={{ position: 'relative', flex: '1 1 240px', background: 'var(--surface)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '999px', padding: '10px 32px 10px 10px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3)', cursor: 'default' }} className="glass-card-hover">
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                  <Users size={26} strokeWidth={2.5} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    <AnimatedNumber value={users.length} />
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Users</span>
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -4, scale: 1.02 }} style={{ position: 'relative', flex: '1 1 240px', background: 'var(--surface)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: '999px', padding: '10px 32px 10px 10px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3)', cursor: 'default' }} className="glass-card-hover">
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                  <Building2 size={26} strokeWidth={2.5} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    <AnimatedNumber value={departments.length} />
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Departments</span>
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
