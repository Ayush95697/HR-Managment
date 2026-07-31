import React, { useEffect } from 'react';
import { motion, useAnimation, useReducedMotion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, LayoutDashboard, MessageSquare,
  ShieldCheck, Server, Database, Monitor, Wrench, FileText, Settings, Key,
  LogIn, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Logo from '../components/shared/Logo';
import { getAllCards } from '../components/DashboardPreviewCard';
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

// ─── Dashboard cards for hero marquee ─────────────────────────────────────────
const ALL_CARDS = getAllCards('hero');

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
          <Logo size="md" showText={true} />
        </button>
        <nav className={styles.nav}>
          <button className={styles.navLink} onClick={() => scrollTo('how-to-use')}>How it Works</button>
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
          <Logo size="xxl" showText={false} />
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

      {/* ── How to Use ──────────────────────────────────────────────────────── */}
      <section id="how-to-use" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>From login to full workforce management — six simple steps.</p>
          </div>
        </FadeInWhenVisible>
        <div className={styles.stepsGrid}>
          {[
            {
              title: 'Sign In as Your Role',
              desc: 'JWT-secured login with role-based access.',
              icon: Key,
            },
            {
              title: 'Explore Live Analytics',
              desc: 'Real-time charts and live activity feed.',
              icon: BarChart3,
            },
            {
              title: 'Create Boards & Columns',
              desc: 'Manage tasks in customizable department boards.',
              icon: LayoutDashboard,
            },
            {
              title: 'Assign Tasks & Collaborate',
              desc: 'Assign tasks with priorities, due dates, and comments.',
              icon: MessageSquare,
            },
            {
              title: 'Send Emails',
              desc: 'Send HR emails using predefined or custom templates.',
              icon: ShieldCheck,
            },
            {
              title: 'Monitor with Audit Logs',
              desc: 'Track and query all system actions for compliance.',
              icon: FileText,
            },
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

      {/* ── Technologies ────────────────────────────────────────────────────── */}
      <section id="technologies" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built With Modern Tech</h2>
            <p className={styles.sectionSubtitle}>A production-grade full-stack architecture from frontend to AI.</p>
          </div>
        </FadeInWhenVisible>
        <div className={styles.techGrid}>
          <FadeInWhenVisible delay={0.1} yOffset={20}>
            <div className={styles.techCategoryCard}>
              <div className={styles.techCategoryHeader}>
                <div className={styles.techCategoryIcon}><Monitor size={24} /></div>
                <h3>Frontend Ecosystem</h3>
              </div>
              <div className={styles.techMiniGrid}>
                <div className={styles.techMiniCard}>React 18 + Vite</div>
                <div className={styles.techMiniCard}>TypeScript</div>
                <div className={styles.techMiniCard}>Framer Motion</div>
                <div className={styles.techMiniCard}>@dnd-kit/core</div>
                <div className={styles.techMiniCard}>TanStack Query</div>
                <div className={styles.techMiniCard}>Tailwind CSS + Modules</div>
                <div className={styles.techMiniCard}>Zustand (State Management)</div>
                <div className={styles.techMiniCard}>Zod + React Hook Form</div>
              </div>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2} yOffset={20}>
            <div className={styles.techCategoryCard}>
              <div className={styles.techCategoryHeader}>
                <div className={styles.techCategoryIcon}><Server size={24} /></div>
                <h3>Backend & Infrastructure</h3>
              </div>
              <div className={styles.techMiniGrid}>
                <div className={styles.techMiniCard}>ASP.NET Core 8</div>
                <div className={styles.techMiniCard}>Entity Framework Core</div>
                <div className={styles.techMiniCard}>SQL Server Database</div>
                <div className={styles.techMiniCard}>JWT Auth (HMACSHA256)</div>
                <div className={styles.techMiniCard}>NVIDIA LLaMA 3.1 70B (AI)</div>
                <div className={styles.techMiniCard}>Azure Blob Storage</div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ── Overview ────────────────────────────────────────────────────────── */}
      <section id="overview" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Platform Overview</h2>
            <p className={styles.sectionSubtitle}>Six purpose-built modules, one unified HR platform.</p>
          </div>
        </FadeInWhenVisible>
        <div className={styles.featuresGrid}>
          {[
            {
              title: 'Kanban Boards',
              desc: 'Drag-and-drop task tracking with priorities.',
              icon: LayoutDashboard,
            },
            {
              title: 'Analytics Dashboard',
              desc: '4 real-time filterable HR charts.',
              icon: BarChart3,
            },
            {
              title: 'Email Center',
              desc: '15+ HR templates with dynamic placeholders.',
              icon: MessageSquare,
            },
            {
              title: 'Role-Based Access',
              desc: 'Admin, HR, and Employee protected routes.',
              icon: LogIn,
            },
            {
              title: 'Audit Logs',
              desc: 'Timestamped logging of all system events.',
              icon: FileText,
            },
            {
              title: 'AI Chat Assistant',
              desc: 'In-app LLaMA 3.1 AI for quick navigation.',
              icon: Server,
            },
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
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} WorkTrail. All rights reserved.</p>
      </footer>
    </div>
  );
}
