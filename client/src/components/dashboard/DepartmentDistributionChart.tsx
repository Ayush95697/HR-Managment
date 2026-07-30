import { useDepartmentDistribution } from '../../hooks/useDashboardData';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuthStore } from '../../store/authStore';

const VIBRANT_GRADIENT_SPECTRUM = [
  '#00FFFF', // Radiant Cyan
  '#38bdf8', // Sky Blue
  '#6366f1', // Deep Indigo
  '#a855f7', // Vivid Purple
  '#7F00FF', // Deep Purple
  '#d946ef', // Neon Fuchsia
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (!percent || percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#ffffff" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize="11px"
      fontWeight="700"
      style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.8))' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DepartmentDistributionChart() {
  const { user } = useAuthStore();
  const { data, isLoading } = useDepartmentDistribution();

  if (user?.role !== 'Admin') {
    return null;
  }

  const totalHeadcount = data ? data.reduce((acc, curr) => acc + curr.headCount, 0) : 0;

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
      <div>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700 }}>Department Distribution</h3>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Headcount & percentage share by department</p>
      </div>
      
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00FFFF' }}>
          Loading department metrics...
        </div>
      ) : (
        <div style={{ height: '280px', width: '100%', position: 'relative' }}>
          {/* Centered Total inside Donut Hole */}
          <div 
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00FFFF', lineHeight: 1, textShadow: '0 0 12px rgba(0, 255, 255, 0.6)' }}>
              {totalHeadcount}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px', letterSpacing: '0.05em' }}>
              TOTAL USERS
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
              <Pie
                data={data}
                dataKey="headCount"
                nameKey="department"
                cx="50%"
                cy="42%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                cornerRadius={6}
                stroke="none"
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {data?.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={VIBRANT_GRADIENT_SPECTRUM[index % VIBRANT_GRADIENT_SPECTRUM.length]} 
                    style={{ filter: `drop-shadow(0 0 8px ${VIBRANT_GRADIENT_SPECTRUM[index % VIBRANT_GRADIENT_SPECTRUM.length]}66)` }}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const itemData = payload[0].payload;
                    const count = itemData.headCount;
                    const pct = totalHeadcount > 0 ? ((count / totalHeadcount) * 100).toFixed(1) : '0';
                    
                    return (
                      <div style={{
                        background: 'rgba(9, 10, 20, 0.95)', 
                        border: '1px solid #00FFFF', 
                        borderRadius: '10px', 
                        padding: '12px 16px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 255, 0.3)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: payload[0].payload.fill || VIBRANT_GRADIENT_SPECTRUM[0], boxShadow: `0 0 8px ${payload[0].payload.fill}` }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{itemData.department}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '18px' }}>
                          {count} Members <span style={{ fontWeight: 700, color: '#00FFFF' }}>({pct}%)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
