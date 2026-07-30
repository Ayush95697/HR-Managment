import { useState } from 'react';
import { useWorkloadBalance } from '../../hooks/useDashboardData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { BarChart2, LayoutList, AlertTriangle, ShieldCheck, User } from 'lucide-react';

const CHART_MARGIN = { top: 5, right: 20, left: 35, bottom: 5 };
const TOOLTIP_CURSOR = { fill: 'rgba(0, 255, 255, 0.04)' };
const TOOLTIP_CONTENT_STYLE = { background: 'rgba(9, 10, 20, 0.95)', border: '1px solid #00FFFF', borderRadius: '10px', color: '#f8fafc', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(0, 255, 255, 0.3)' };
const LEGEND_WRAPPER_STYLE = { fontSize: '0.75rem', paddingTop: '6px', color: 'var(--text-secondary)' };

export function WorkloadBalanceChart() {
  const { data = [], isLoading } = useWorkloadBalance();
  const [viewMode, setViewMode] = useState<'meters' | 'chart'>('meters');

  const totalHigh = data.reduce((acc, item) => acc + (item.high || 0), 0);
  const totalCritical = data.reduce((acc, item) => acc + (item.critical || 0), 0);

  const getStatusBadge = (high: number, critical: number) => {
    const total = high + critical;
    if (total >= 5 || critical >= 3) {
      return { label: 'Heavy Load', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' };
    }
    if (total >= 3 || critical >= 1) {
      return { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
    }
    return { label: 'Balanced', color: '#00FFFF', bg: 'rgba(0, 255, 255, 0.15)', border: 'rgba(0, 255, 255, 0.4)' };
  };

  return (
    <div 
      className="glass-card-antigravity hover-scale-subtle"
      style={{
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '380px',
        maxHeight: '380px',
      }}
    >
      {/* Card Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700 }}>Workload Distribution</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>High & Critical priority task allocation across active team members</p>
        </div>

        {/* View Switcher Controls */}
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '9999px', padding: '3px', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
          <button
            onClick={() => setViewMode('meters')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'meters' ? 'linear-gradient(135deg, #7F00FF 0%, #00FFFF 100%)' : 'transparent',
              color: viewMode === 'meters' ? '#ffffff' : '#A0A0B0',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'meters' ? '0 0 12px rgba(0, 255, 255, 0.4)' : 'none',
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
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'chart' ? 'linear-gradient(135deg, #7F00FF 0%, #00FFFF 100%)' : 'transparent',
              color: viewMode === 'chart' ? '#ffffff' : '#A0A0B0',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'chart' ? '0 0 12px rgba(0, 255, 255, 0.4)' : 'none',
            }}
          >
            <BarChart2 size={14} />
            Stacked Chart
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'rgba(127, 0, 255, 0.1)', borderRadius: '12px', padding: '8px 12px', border: '1px solid rgba(127, 0, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(127, 0, 255, 0.2)', color: '#00FFFF' }}>
            <User size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Assigned Team</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.length} Members</div>
          </div>
        </div>

        <div style={{ background: 'rgba(0, 255, 255, 0.1)', borderRadius: '12px', padding: '8px 12px', border: '1px solid rgba(0, 255, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0, 255, 255, 0.2)', color: '#00FFFF' }}>
            <ShieldCheck size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>High Priority</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#00FFFF' }}>{totalHigh} Tasks</div>
          </div>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', padding: '8px 12px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            <AlertTriangle size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Critical Priority</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171' }}>{totalCritical} Tasks</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00FFFF', minHeight: '180px' }}>
          Loading workload metrics...
        </div>
      ) : data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '180px' }}>
          No workload data available
        </div>
      ) : viewMode === 'meters' ? (
        /* Capacity Progress Meters View (Neon Tubes Style) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {data.map((item) => {
            const userTotal = (item.high || 0) + (item.critical || 0);
            const status = getStatusBadge(item.high || 0, item.critical || 0);
            const maxCapacityRef = 8;

            return (
              <div 
                key={item.userId || item.userName}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(0, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
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
                        background: 'linear-gradient(135deg, #7F00FF, #00FFFF)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        boxShadow: '0 0 8px rgba(0, 255, 255, 0.4)'
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
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 255, 255, 0.15)', color: '#00FFFF', fontWeight: 600 }}>
                        {item.high} High
                      </span>
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(127, 0, 255, 0.2)', color: '#a855f7', fontWeight: 600 }}>
                        {item.critical} Critical
                      </span>
                    </div>

                    <span 
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
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

                {/* Neon Tube Meter Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    style={{
                      flex: 1,
                      height: '8px',
                      borderRadius: '50px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      overflow: 'hidden',
                      display: 'flex',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {/* Glowing Progress Fill (Neon Tube) */}
                    <div 
                      style={{
                        width: `${userTotal > 0 ? (userTotal / maxCapacityRef) * 100 : 0}%`,
                        height: '100%',
                        borderRadius: '50px',
                        background: 'linear-gradient(90deg, #00FFFF 0%, #7F00FF 100%)',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.7), 0 0 15px rgba(127, 0, 255, 0.5)',
                        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      title={`${userTotal} Active tasks allocated`}
                    />
                  </div>

                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00FFFF', minWidth: '40px', textAlign: 'right' }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.06)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="userName" width={110} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={TOOLTIP_CURSOR}
                contentStyle={TOOLTIP_CONTENT_STYLE}
              />
              <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} />
              <Bar dataKey="high" stackId="a" fill="#00FFFF" name="High Priority" barSize={12} radius={[50, 0, 0, 50]} />
              <Bar dataKey="critical" stackId="a" fill="#7F00FF" name="Critical Priority" radius={[0, 50, 50, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
