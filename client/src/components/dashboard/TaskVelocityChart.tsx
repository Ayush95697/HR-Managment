import { useState } from 'react';
import { useTaskVelocity } from '../../hooks/useDashboardData';
import { RangeSelector } from './DashboardFilters';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function TaskVelocityChart() {
  const [range, setRange] = useState(30);
  const { data, isLoading } = useTaskVelocity(range);

  return (
    <div 
      style={{
        background: 'var(--surface)',
        borderRadius: '32px 12px 32px 12px',
        border: '1px solid var(--border)',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '380px',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.04)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      className="hover-scale-subtle"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700 }}>Task Velocity</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Completed task trends over time</p>
        </div>
        <RangeSelector value={range} onChange={setRange} options={[7, 30, 90]} />
      </div>
      
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Loading velocity metrics...
        </div>
      ) : (
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="bucket" 
                tickFormatter={formatDateShort} 
                stroke="var(--text-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                allowDecimals={false} 
                stroke="var(--text-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{ fill: 'var(--surface-hover, rgba(255, 255, 255, 0.03))' }}
                labelFormatter={(label) => new Date(label as string).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                formatter={(value: any) => [`${value} tasks completed`, 'Velocity']}
                contentStyle={{ 
                  background: 'var(--surface-2, #1e293b)', 
                  border: '1px solid var(--accent, rgba(99, 102, 241, 0.3))', 
                  borderRadius: '8px', 
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#818cf8', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#6366f1" 
                strokeWidth={2}
                fill="url(#velocityGrad)" 
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
