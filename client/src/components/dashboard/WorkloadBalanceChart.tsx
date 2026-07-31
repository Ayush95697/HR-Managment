import { useState } from 'react';
import { useWorkloadBalance } from '../../hooks/useDashboardData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { BarChart2, LayoutList, AlertTriangle, ShieldCheck, User } from 'lucide-react';

const CHART_MARGIN = { top: 5, right: 20, left: 35, bottom: 5 };
const TOOLTIP_CURSOR = { fill: 'var(--surface-hover, rgba(255, 255, 255, 0.03))' };
const TOOLTIP_CONTENT_STYLE = { background: 'var(--surface-2, #1e293b)', border: '1px solid var(--accent, rgba(99, 102, 241, 0.3))', borderRadius: '8px', color: 'var(--text-primary, #f8fafc)', fontSize: '12px' };
const LEGEND_WRAPPER_STYLE = { fontSize: '0.75rem', paddingTop: '6px', color: 'var(--text-secondary)' };
const BAR_RADIUS: [number, number, number, number] = [0, 4, 4, 0];

export function WorkloadBalanceChart() {
  const { data = [], isLoading } = useWorkloadBalance();
  const [viewMode, setViewMode] = useState<'meters' | 'chart'>('meters');

  // Compute workload statistics
  const totalHigh = data.reduce((acc, item) => acc + (item.high || 0), 0);
  const totalCritical = data.reduce((acc, item) => acc + (item.critical || 0), 0);


  const getStatusBadge = (high: number, critical: number) => {
    const total = high + critical;
    if (total >= 5 || critical >= 3) {
      return { label: 'Heavy Load', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
    }
    if (total >= 3 || critical >= 1) {
      return { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { label: 'Balanced', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
  };

  return (
    <div 
      style={{
        background: 'var(--surface)',
        borderRadius: '24px 24px 80px 24px',
        border: '1px solid var(--border)',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '380px',
        maxHeight: '380px',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.04)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      className="hover-scale-subtle"
    >
      {/* Card Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700 }}>Workload Distribution</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>High & Critical priority task allocation across active team members</p>
        </div>

        {/* View Switcher Controls */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setViewMode('meters')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'meters' ? '#4f46e5' : 'transparent',
              color: viewMode === 'meters' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LayoutList size={14} />
            Capacity Meters
          </button>
          <button
            onClick={() => setViewMode('chart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'chart' ? '#4f46e5' : 'transparent',
              color: viewMode === 'chart' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <BarChart2 size={14} />
            Stacked Chart
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'rgba(79, 70, 229, 0.08)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8' }}>
            <User size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Assigned Team</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.length} Members</div>
          </div>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <ShieldCheck size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>High Priority</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8' }}>{totalHigh} Tasks</div>
          </div>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <AlertTriangle size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Critical Priority</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171' }}>{totalCritical} Tasks</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '180px' }}>
          Loading workload metrics...
        </div>
      ) : data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '180px' }}>
          No workload data available
        </div>
      ) : viewMode === 'meters' ? (
        /* Capacity Progress Meters View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {data.map((item) => {
            const userTotal = (item.high || 0) + (item.critical || 0);
            const status = getStatusBadge(item.high || 0, item.critical || 0);
            const maxCapacityRef = 8; // benchmark count for max meter width


            return (
              <div 
                key={item.userId || item.userName}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* User Row Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {item.userName ? item.userName.charAt(0) : 'U'}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.userName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                        {item.high} High
                      </span>
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', fontWeight: 600 }}>
                        {item.critical} Critical
                      </span>
                    </div>

                    <span 
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        color: status.color,
                        background: status.bg,
                        border: `1px solid ${status.border}`
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Meter Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    style={{
                      flex: 1,
                      height: '6px',
                      borderRadius: '3px',
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                      display: 'flex'
                    }}
                  >
                    {/* High Priority Segment */}
                    <div 
                      style={{
                        width: `${userTotal > 0 ? (item.high / Math.max(userTotal, maxCapacityRef)) * 100 : 0}%`,
                        height: '100%',
                        background: '#818cf8',
                        transition: 'width 0.4s ease'
                      }}
                      title={`${item.high} High priority tasks`}
                    />
                    {/* Critical Priority Segment */}
                    <div 
                      style={{
                        width: `${userTotal > 0 ? (item.critical / Math.max(userTotal, maxCapacityRef)) * 100 : 0}%`,
                        height: '100%',
                        background: '#4f46e5',
                        transition: 'width 0.4s ease'
                      }}
                      title={`${item.critical} Critical priority tasks`}
                    />
                  </div>

                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
                    {userTotal} {userTotal === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Stacked Bar Chart View */
        <div style={{ height: '220px', width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          <ResponsiveContainer width="99%" height={Math.max(220, data.length * 45)}>
            <BarChart data={data} layout="vertical" margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="userName" width={110} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={TOOLTIP_CURSOR}
                contentStyle={TOOLTIP_CONTENT_STYLE}
              />
              <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} />
              <Bar dataKey="high" stackId="a" fill="#818cf8" name="High Priority" barSize={14} />
              <Bar dataKey="critical" stackId="a" fill="#4f46e5" name="Critical Priority" radius={BAR_RADIUS} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

