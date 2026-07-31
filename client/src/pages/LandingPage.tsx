import React, { useEffect } from 'react';
import { motion, useAnimation, useReducedMotion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, LayoutDashboard, MessageSquare,
  ShieldCheck, Server, Database, Monitor, Wrench, FileText, Settings, Key,
  LogIn, ChevronLeft, ChevronRight,
} from 'lucide-react';
import styles from './LandingPage.module.css';

// ─── Scroll-reveal helper ─────────────────────────────────────────────────────
const FadeInWhenVisible = ({ children, delay = 0, yOffset = 50 }: { children: React.ReactNode; delay?: number; yOffset?: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─── Mini dashboard card mockups ──────────────────────────────────────────────
const TimelineCard = () => (
  <div className={styles.dashCard}>
    <div className={styles.dashHeader}>
      <span className={styles.dot} style={{ background: '#ef4444' }} />
      <span className={styles.dot} style={{ background: '#f59e0b' }} />
      <span className={styles.dot} style={{ background: '#22c55e' }} />
      <span className={styles.dashTitle}>Project Timeline</span>
    </div>
    <div className={styles.dashBody}>
      {[
        { label: 'Design',   w: '60%', l: '5%',  c: '#8b5cf6' },
        { label: 'Frontend', w: '45%', l: '30%', c: '#6366f1' },
        { label: 'Backend',  w: '50%', l: '20%', c: '#3b82f6' },
        { label: 'QA',       w: '30%', l: '65%', c: '#06b6d4' },
      ].map(r => (
        <div key={r.label} className={styles.ganttRow}>
          <span className={styles.ganttLabel}>{r.label}</span>
          <div className={styles.ganttTrack}>
            <div className={styles.ganttBar} style={{ width: r.w, left: r.l, background: r.c }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsCard = () => (
  <div className={styles.dashCard}>
    <div className={styles.dashHeader}>
      <span className={styles.dot} style={{ background: '#ef4444' }} />
      <span className={styles.dot} style={{ background: '#f59e0b' }} />
      <span className={styles.dot} style={{ background: '#22c55e' }} />
      <span className={styles.dashTitle}>Progress Analytics</span>
    </div>
    <div className={styles.dashBody} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ flexShrink: 0 }}>
        <circle cx="44" cy="44" r="34" fill="none" stroke="#1e2235" strokeWidth="12" />
        <circle cx="44" cy="44" r="34" fill="none" stroke="#8b5cf6" strokeWidth="12"
          strokeDasharray="134 80" strokeLinecap="round" strokeDashoffset="-15" />
        <circle cx="44" cy="44" r="34" fill="none" stroke="#3b82f6" strokeWidth="12"
          strokeDasharray="53 161" strokeLinecap="round" strokeDashoffset="-149" />
        <text x="44" y="48" textAnchor="middle" fill="#f1f5f9" fontSize="13" fontWeight="700">63%</text>
      </svg>
      <div style={{ flex: 1 }}>
        {[{ l: 'Complete', v: '63%', c: '#8b5cf6' }, { l: 'In Review', v: '25%', c: '#3b82f6' }, { l: 'Pending', v: '12%', c: '#2d3a5c' }].map(({ l, v, c }) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{l}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TaskBoardCard = () => (
  <div className={styles.dashCard}>
    <div className={styles.dashHeader}>
      <span className={styles.dot} style={{ background: '#ef4444' }} />
      <span className={styles.dot} style={{ background: '#f59e0b' }} />
      <span className={styles.dot} style={{ background: '#22c55e' }} />
      <span className={styles.dashTitle}>Sprint Board</span>
    </div>
    <div className={styles.dashBody} style={{ display: 'flex', gap: 10 }}>
      {[
        { label: 'To Do',       c: '#475569', tasks: ['Design review', 'API docs', 'Unit tests'] },
        { label: 'In Progress', c: '#7c3aed', tasks: ['Auth module', 'Dashboard UI'] },
        { label: 'Done',        c: '#059669', tasks: ['DB schema', 'Login page', 'CI/CD'] },
      ].map(col => (
        <div key={col.label} style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.c }} />
            {col.label}
          </div>
          {col.tasks.map(t => (
            <div key={t} style={{ background: '#1a2035', border: '1px solid #2d3a5c', borderRadius: 6, padding: '5px 8px', marginBottom: 5, fontSize: 10, color: '#cbd5e1' }}>{t}</div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const ReportCard = () => (
  <div className={styles.dashCard}>
    <div className={styles.dashHeader}>
      <span className={styles.dot} style={{ background: '#ef4444' }} />
      <span className={styles.dot} style={{ background: '#f59e0b' }} />
      <span className={styles.dot} style={{ background: '#22c55e' }} />
      <span className={styles.dashTitle}>Client Reporting</span>
    </div>
    <div className={styles.dashBody}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[{ l: 'Revenue', v: '$48.2K', d: '+12%' }, { l: 'Tasks', v: '341', d: '+8%' }, { l: 'Members', v: '24', d: '+3' }].map(s => (
          <div key={s.l} style={{ flex: 1, background: '#141928', borderRadius: 7, padding: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>{s.v}</div>
            <div style={{ fontSize: 9, color: '#64748b' }}>{s.l}</div>
            <div style={{ fontSize: 9, color: '#22c55e' }}>{s.d}</div>
          </div>
        ))}
      </div>
      <svg width="100%" height="38" viewBox="0 0 220 38">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points="0,33 40,26 80,18 110,20 150,8 180,12 220,3" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="0,33 40,26 80,18 110,20 150,8 180,12 220,3 220,38 0,38" fill="url(#lg1)" />
      </svg>
    </div>
  </div>
);

const TeamCard = () => (
  <div className={styles.dashCard}>
    <div className={styles.dashHeader}>
      <span className={styles.dot} style={{ background: '#ef4444' }} />
      <span className={styles.dot} style={{ background: '#f59e0b' }} />
      <span className={styles.dot} style={{ background: '#22c55e' }} />
      <span className={styles.dashTitle}>Team Hub</span>
    </div>
    <div className={styles.dashBody}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
        {(['AK','SR','MJ','PL','RK','TC'] as const).map((init, i) => (
          <div key={init} style={{ width: 32, height: 32, borderRadius: '50%', background: ['#7c3aed','#3b82f6','#059669','#8b5cf6','#6366f1','#2563eb'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{init}</div>
        ))}
      </div>
      {[{ u: 'AK', m: 'Dashboard is live ✓', t: '2m' }, { u: 'SR', m: 'Running final tests', t: '5m' }, { u: 'MJ', m: 'PR ready for review', t: '8m' }].map((msg, i) => (
        <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 7, alignItems: 'flex-start' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: ['#7c3aed','#3b82f6','#059669'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{msg.u}</div>
          <div style={{ flex: 1, background: '#141928', borderRadius: 6, padding: '4px 8px' }}>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>{msg.m}</span>
          </div>
          <span style={{ fontSize: 8, color: '#475569', paddingTop: 2 }}>{msg.t}</span>
        </div>
      ))}
    </div>
  </div>
);

const DashOverviewCard = () => (
  <div className={styles.dashCard}>
    <div className={styles.dashHeader}>
      <span className={styles.dot} style={{ background: '#ef4444' }} />
      <span className={styles.dot} style={{ background: '#f59e0b' }} />
      <span className={styles.dot} style={{ background: '#22c55e' }} />
      <span className={styles.dashTitle}>Overview Dashboard</span>
    </div>
    <div className={styles.dashBody}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
        {[
          { l: 'Active Tasks', v: '128', c: '#7c3aed' },
          { l: 'Team Members', v: '24',  c: '#3b82f6' },
          { l: 'Completed',   v: '89%', c: '#059669' },
          { l: 'Due Today',   v: '7',   c: '#f59e0b' },
        ].map(s => (
          <div key={s.l} style={{ background: '#141928', borderRadius: 7, padding: '7px 9px', borderLeft: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{s.v}</div>
            <div style={{ fontSize: 9, color: '#64748b' }}>{s.l}</div>
          </div>
        ))}
      </div>
      <svg width="100%" height="34" viewBox="0 0 220 34">
        {[30, 50, 70, 45, 80, 60, 90].map((h, i) => (
          <rect key={i} x={i * 32 + 2} y={34 - h * 0.34} width="24" height={h * 0.34} rx="4"
            fill={i === 6 ? '#8b5cf6' : '#2d3a5c'} />
        ))}
      </svg>
    </div>
  </div>
);

const ALL_CARDS = [
  <TimelineCard key="t" />,
  <AnalyticsCard key="a" />,
  <TaskBoardCard key="k" />,
  <ReportCard key="r" />,
  <TeamCard key="tm" />,
  <DashOverviewCard key="d" />,
];

// ─── Main page component ──────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const workCtrl  = useAnimation();
  const trailCtrl = useAnimation();
  const badgeCtrl = useAnimation();
  const tagCtrl   = useAnimation();
  const btnCtrl   = useAnimation();

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const run = async () => {
      if (prefersReducedMotion) {
        workCtrl.start({ opacity: 1, x: 0 });
        trailCtrl.start({ opacity: 1, x: 0 });
        badgeCtrl.start({ opacity: 1, scale: 1 });
        tagCtrl.start({ opacity: 1, y: 0 });
        btnCtrl.start({ opacity: 1, y: 0 });
        return;
      }

      // — Entrance —
      await Promise.all([
        badgeCtrl.start({ scale: 1, opacity: 1, transition: { duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }),
        workCtrl.start({ x: 0, opacity: 1, transition: { duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] } }),
        trailCtrl.start({ x: 0, opacity: 1, transition: { duration: 1.1, delay: 0.22, ease: [0.16, 1, 0.3, 1] } }),
      ]);
      await tagCtrl.start({ opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } });
      await btnCtrl.start({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } });

      // — Continuous float —
      workCtrl.start({ y: [0, -8, 0], transition: { duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' } });
      trailCtrl.start({ y: [0, -8, 0], transition: { duration: 4.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror', delay: 0.6 } });
      badgeCtrl.start({ y: [0, -6, 0], transition: { duration: 5, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror', delay: 1.2 } });
    };
    run();
  }, [prefersReducedMotion]);

  return (
    <div className={styles.page}>

      {/* ── Static background: grid + circuit SVG ─────────────────────── */}
      <div className={styles.bgGrid} />
      <svg className={styles.circuitSvg} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <line x1="180" y1="0"   x2="180" y2="310" stroke="#6366f1" strokeWidth="1" opacity="0.09" />
        <line x1="180" y1="310" x2="480" y2="310" stroke="#6366f1" strokeWidth="1" opacity="0.09" />
        <circle cx="180" cy="310" r="3.5" fill="#6366f1" opacity="0.25" />
        <line x1="1260" y1="900" x2="1260" y2="590" stroke="#8b5cf6" strokeWidth="1" opacity="0.09" />
        <line x1="1260" y1="590" x2="960"  y2="590" stroke="#8b5cf6" strokeWidth="1" opacity="0.09" />
        <circle cx="1260" cy="590" r="3.5" fill="#8b5cf6" opacity="0.25" />
        <circle cx="720"  cy="450" r="2"   fill="#3b82f6" opacity="0.15" />
      </svg>

      {/* ── Infinite marquee dashboard row ────────────────────────────── */}
      <div className={styles.marqueeWrap} aria-hidden>
        <motion.div
          className={styles.marqueeTrack}
          animate={prefersReducedMotion ? {} : { x: ['0%', '-50%'] }}
          transition={{ duration: 65, ease: 'linear', repeat: Infinity }}
        >
          {[...ALL_CARDS, ...ALL_CARDS].map((card, i) => (
            <div key={i} className={styles.marqueeItem}>{card}</div>
          ))}
        </motion.div>
        {/* Vignette: fades cards into page bg at all edges */}
        <div className={styles.vignetteTop} />
        <div className={styles.vignetteBottom} />
        <div className={styles.vignetteLeft} />
        <div className={styles.vignetteRight} />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className={styles.navbar}>
        <button className={styles.navBrand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className={styles.navBadge}>W</div>
          <span className={styles.navWordmark}>
            <span className={styles.navWork}>Work</span>
            <span className={styles.navTrail}>Trail</span>
          </span>
        </button>
        <nav className={styles.nav}>
          <button className={styles.navLink} onClick={() => scrollTo('how-to-use')}>How to Use</button>
          <button className={styles.navLink} onClick={() => scrollTo('technologies')}>Technologies</button>
          <button className={styles.navLink} onClick={() => scrollTo('overview')}>Overview</button>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        {/* Decorative chevrons */}
        <ChevronLeft className={styles.chevronL} aria-hidden />
        <ChevronRight className={styles.chevronR} aria-hidden />

        {/* Glowing badge above wordmark */}
        <motion.div
          className={styles.heroBadgeWrap}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={badgeCtrl}
        >
          <div className={styles.heroBadgeGlow} />
          <div className={styles.heroBadge}>W</div>
        </motion.div>

        {/* Wordmark: Work ← → Trail */}
        <div className={styles.wordmarkRow}>
          <motion.span
            className={styles.wordWork}
            initial={{ x: prefersReducedMotion ? 0 : '-120%', opacity: 0 }}
            animate={workCtrl}
          >
            Work
          </motion.span>
          <motion.span
            className={styles.wordTrail}
            initial={{ x: prefersReducedMotion ? 0 : '120%', opacity: 0 }}
            animate={trailCtrl}
          >
            Trail
          </motion.span>
        </div>

        {/* Tagline */}
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 18 }}
          animate={tagCtrl}
        >
          Follow the work, trust the trail.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.95 }}
          animate={btnCtrl}
        >
          <motion.button
            className={styles.ctaBtn}
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Sign In &nbsp;→
          </motion.button>
        </motion.div>
      </section>

      {/* ── How to Use ──────────────────────────────────────────────────── */}
      <section id="how-to-use" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>Get up and running in minutes with our streamlined workflow.</p>
          </div>
        </FadeInWhenVisible>
        <div className={styles.stepsGrid}>
          {[
            { title: 'Login',            desc: 'Sign in securely with your designated role (Admin, HR, or Employee).', icon: Key },
            { title: 'Explore Dashboard',desc: "Get a bird's-eye view of organizational stats and recent activity.", icon: BarChart3 },
            { title: 'Manage Boards',    desc: 'Create Kanban boards, assign tasks, and track project progress visually.', icon: LayoutDashboard },
            { title: 'Collaborate',      desc: 'Use the built-in Email Center to communicate effectively across the platform.', icon: MessageSquare },
            { title: 'Track & Audit',    desc: 'Monitor changes and review comprehensive audit logs for compliance.', icon: ShieldCheck },
          ].map((step, i) => (
            <FadeInWhenVisible key={i} delay={i * 0.1}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>{i + 1}</div>
                <div className={styles.stepIcon}><step.icon size={24} /></div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </section>

      {/* ── Technologies ────────────────────────────────────────────────── */}
      <section id="technologies" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built With Modern Tech</h2>
            <p className={styles.sectionSubtitle}>Powered by a robust and scalable technology stack.</p>
          </div>
        </FadeInWhenVisible>
        <div className={styles.techGrid}>
          {[
            { name: 'React 18',          cat: 'Frontend', catClass: styles.catFrontend, icon: Monitor },
            { name: 'TypeScript',         cat: 'Frontend', catClass: styles.catFrontend, icon: Monitor },
            { name: 'ASP.NET Core',       cat: 'Backend',  catClass: styles.catBackend,  icon: Server },
            { name: 'Entity Framework',   cat: 'Backend',  catClass: styles.catBackend,  icon: Database },
            { name: 'SQL Server',         cat: 'Database', catClass: styles.catDatabase, icon: Database },
            { name: 'Vite',               cat: 'Tooling',  catClass: styles.catTooling,  icon: Wrench },
            { name: 'Tailwind CSS',       cat: 'Styling',  catClass: styles.catStyling,  icon: Monitor },
            { name: 'Zustand',            cat: 'State',    catClass: styles.catFrontend, icon: Settings },
          ].map((tech, i) => (
            <FadeInWhenVisible key={i} delay={i * 0.05} yOffset={20}>
              <div className={styles.techCard}>
                <div className={styles.techIconWrapper}><tech.icon size={20} /></div>
                <div className={styles.techInfo}>
                  <div className={styles.techName}>{tech.name}</div>
                  <div className={`${styles.techCategory} ${tech.catClass}`}>{tech.cat}</div>
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </section>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      <section id="overview" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Platform Overview</h2>
            <p className={styles.sectionSubtitle}>Everything you need to manage your workforce efficiently.</p>
          </div>
        </FadeInWhenVisible>
        <div className={styles.featuresGrid}>
          {[
            { title: 'Kanban Boards',    desc: 'Visual task tracking with drag & drop for seamless project management.', icon: LayoutDashboard },
            { title: 'User Management', desc: 'Role-based access control for Admins, HR personnel, and Employees.', icon: LogIn },
            { title: 'Email Center',    desc: 'Built-in communication hub to send, receive, and manage internal messages.', icon: MessageSquare },
            { title: 'Audit Logs',      desc: 'Full activity trail tracking events, logins, and data changes for compliance.', icon: FileText },
          ].map((feat, i) => (
            <FadeInWhenVisible key={i} delay={i * 0.1}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}><feat.icon size={28} /></div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
        <FadeInWhenVisible delay={0.4}>
          <div className={styles.statsRow}>
            {[{ v: '3', l: 'Distinct Roles' }, { v: '∞', l: 'Unlimited Boards' }, { v: '100%', l: 'Audit Coverage' }].map(s => (
              <div key={s.l} className={styles.statItem}>
                <div className={styles.statValue}>{s.v}</div>
                <div className={styles.statLabel}>{s.l}</div>
              </div>
            ))}
          </div>
        </FadeInWhenVisible>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} WorkTrail. All rights reserved.</p>
      </footer>
    </div>
  );
}
