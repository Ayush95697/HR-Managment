import React from 'react';
import styles from '../pages/LandingPage.module.css';

type CardVariant = 'hero' | 'ambient';

interface CardProps {
  variant?: CardVariant;
}

// ─── Wrapper that applies variant styling ─────────────────────────────────────
function CardShell({ variant = 'hero', children }: CardProps & { children: React.ReactNode }) {
  if (variant === 'ambient') {
    return (
      <div
        style={{
          transform: 'scale(0.6)',
          filter: 'blur(3px)',
          opacity: 0.3,
          pointerEvents: 'none',
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    );
  }
  return <>{children}</>;
}

// ─── Individual card components ───────────────────────────────────────────────

export function TimelineCard({ variant = 'hero' }: CardProps) {
  return (
    <CardShell variant={variant}>
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
    </CardShell>
  );
}

export function AnalyticsCard({ variant = 'hero' }: CardProps) {
  return (
    <CardShell variant={variant}>
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
    </CardShell>
  );
}

export function TaskBoardCard({ variant = 'hero' }: CardProps) {
  return (
    <CardShell variant={variant}>
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
              <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
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
    </CardShell>
  );
}

export function ReportCard({ variant = 'hero' }: CardProps) {
  return (
    <CardShell variant={variant}>
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
              <div key={s.l} style={{ flex: 1, background: '#141928', borderRadius: 7, padding: 8, textAlign: 'center' as const }}>
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
    </CardShell>
  );
}

export function TeamCard({ variant = 'hero' }: CardProps) {
  return (
    <CardShell variant={variant}>
      <div className={styles.dashCard}>
        <div className={styles.dashHeader}>
          <span className={styles.dot} style={{ background: '#ef4444' }} />
          <span className={styles.dot} style={{ background: '#f59e0b' }} />
          <span className={styles.dot} style={{ background: '#22c55e' }} />
          <span className={styles.dashTitle}>Team Hub</span>
        </div>
        <div className={styles.dashBody}>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7, marginBottom: 12 }}>
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
    </CardShell>
  );
}

export function DashOverviewCard({ variant = 'hero' }: CardProps) {
  return (
    <CardShell variant={variant}>
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
    </CardShell>
  );
}

// ─── Convenience: build all cards for a given variant ─────────────────────────
export function getAllCards(variant: CardVariant = 'hero') {
  return [
    <TimelineCard key="t" variant={variant} />,
    <AnalyticsCard key="a" variant={variant} />,
    <TaskBoardCard key="k" variant={variant} />,
    <ReportCard key="r" variant={variant} />,
    <TeamCard key="tm" variant={variant} />,
    <DashOverviewCard key="d" variant={variant} />,
  ];
}
