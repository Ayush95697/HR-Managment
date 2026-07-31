import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, BarChart3, LayoutDashboard, MessageSquare, 
  ShieldCheck, Server, Database, Monitor, Wrench, FileText, Settings, Key
} from 'lucide-react';
import Button from '../components/shared/Button';
import Logo from '../components/shared/Logo';
import styles from './LandingPage.module.css';

const FadeInWhenVisible = ({ children, delay = 0, yOffset = 50 }: { children: React.ReactNode, delay?: number, yOffset?: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.page}>
      {/* Background Orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Header */}
      <header className={styles.header}>
        <div style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo size="md" showText={true} />
        </div>
        <nav className={styles.nav}>
          <button className={styles.navLink} onClick={() => scrollToSection('how-to-use')}>How to Use</button>
          <button className={styles.navLink} onClick={() => scrollToSection('technologies')}>Technologies</button>
          <button className={styles.navLink} onClick={() => scrollToSection('overview')}>Overview</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>

        {/* STAGE 1: Logo icon springs in with glow */}
        <motion.div
          className={styles.heroLogoContainer}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 120, damping: 15 }}
        >
          <div className={styles.logoGlow}>
            <Logo size="xl" showText={false} />
          </div>
        </motion.div>

        {/* STAGE 2: "Work" from LHS + "Trail" from RHS — meet at center */}
        <div className={styles.heroTitleWrapper}>
          <motion.span
            className={styles.wordWork}
            initial={{ opacity: 0, x: -220 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1.0, type: 'spring', stiffness: 90, damping: 20 }}
          >
            Work
          </motion.span>
          <motion.span
            className={styles.wordTrail}
            initial={{ opacity: 0, x: 220 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1.0, type: 'spring', stiffness: 90, damping: 20 }}
          >
            Trail
          </motion.span>
        </div>

        {/* STAGE 3: Tagline — word by word */}
        <p className={styles.heroTagline}>
          {['Follow', 'the', 'work,', 'trust', 'the', 'trail.'].map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.8 + i * 0.15, ease: 'easeOut' }}
            >
              {word}
            </motion.span>
          ))}
        </p>

        {/* STAGE 4: Sign In button */}
        <motion.div
          className={styles.heroActions}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.8, ease: 'easeOut' }}
        >
          <Button size="lg" onClick={() => navigate('/login')}>
            Sign In &nbsp;→
          </Button>
        </motion.div>

      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>Get up and running in minutes with our streamlined workflow.</p>
          </div>
        </FadeInWhenVisible>

        <div className={styles.stepsGrid}>
          {[
            { title: 'Login', desc: 'Sign in securely with your designated role (Admin, HR, or Employee).', icon: Key },
            { title: 'Explore Dashboard', desc: 'Get a bird\'s-eye view of organizational stats and recent activity.', icon: BarChart3 },
            { title: 'Manage Boards', desc: 'Create Kanban boards, assign tasks, and track project progress visually.', icon: LayoutDashboard },
            { title: 'Collaborate', desc: 'Use the built-in Email Center to communicate effectively across the platform.', icon: MessageSquare },
            { title: 'Track & Audit', desc: 'Monitor changes and review comprehensive audit logs for compliance.', icon: ShieldCheck },
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

      {/* Technologies Section */}
      <section id="technologies" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built With Modern Tech</h2>
            <p className={styles.sectionSubtitle}>Powered by a robust and scalable technology stack.</p>
          </div>
        </FadeInWhenVisible>

        <div className={styles.techGrid}>
          {[
            { name: 'React 18', cat: 'Frontend', catClass: styles.catFrontend, icon: Monitor },
            { name: 'TypeScript', cat: 'Frontend', catClass: styles.catFrontend, icon: Monitor },
            { name: 'ASP.NET Core', cat: 'Backend', catClass: styles.catBackend, icon: Server },
            { name: 'Entity Framework', cat: 'Backend', catClass: styles.catBackend, icon: Database },
            { name: 'SQL Server', cat: 'Database', catClass: styles.catDatabase, icon: Database },
            { name: 'Vite', cat: 'Tooling', catClass: styles.catTooling, icon: Wrench },
            { name: 'Tailwind CSS', cat: 'Styling', catClass: styles.catStyling, icon: Monitor },
            { name: 'Zustand', cat: 'State', catClass: styles.catFrontend, icon: Settings },
          ].map((tech, i) => (
            <FadeInWhenVisible key={i} delay={i * 0.05} yOffset={20}>
              <div className={styles.techCard}>
                <div className={styles.techIconWrapper}><tech.icon size={20} className="text-muted-foreground" /></div>
                <div className={styles.techInfo}>
                  <div className={styles.techName}>{tech.name}</div>
                  <div className={`${styles.techCategory} ${tech.catClass}`}>{tech.cat}</div>
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className={styles.section}>
        <FadeInWhenVisible>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Platform Overview</h2>
            <p className={styles.sectionSubtitle}>Everything you need to manage your workforce efficiently.</p>
          </div>
        </FadeInWhenVisible>

        <div className={styles.featuresGrid}>
          {[
            { title: 'Kanban Boards', desc: 'Visual task tracking with drag & drop functionality for seamless project management.', icon: LayoutDashboard },
            { title: 'User Management', desc: 'Comprehensive role-based access control for Admins, HR personnel, and Employees.', icon: LogIn },
            { title: 'Email Center', desc: 'Built-in communication hub to send, receive, and manage internal messaging.', icon: MessageSquare },
            { title: 'Audit Logs', desc: 'Full activity trail tracking system events, logins, and data modifications for compliance.', icon: FileText },
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
            <div className={styles.statItem}>
              <div className={styles.statValue}>3</div>
              <div className={styles.statLabel}>Distinct Roles</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>∞</div>
              <div className={styles.statLabel}>Unlimited Boards</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>100%</div>
              <div className={styles.statLabel}>Audit Trail Coverage</div>
            </div>
          </div>
        </FadeInWhenVisible>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} WorkTrail. All rights reserved.</p>
      </footer>
    </div>
  );
}
