import { useDepartmentDistribution } from '../../hooks/useDashboardData';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuthStore } from '../../store/authStore';

const MONO_COLORS = [
  '#3B82F6', // Primary Indigo
  '#06B6D4', // Soft Indigo
  '#93C5FD', // Light Indigo
  '#475569', // Slate Dark
  '#64748b', // Slate Medium
  '#94a3b8', // Slate Light
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
      style={{ pointerEvents: 'none' }}
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
      style={{
        background: 'var(--surface)',
        borderRadius: '12px 32px 12px 32px',
        border: '1px solid var(--border)',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '380px',
        maxHeight: '380px',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.04)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      className="hover-scale-subtle"
    >
      <div>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700 }}>Department Distribution</h3>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Headcount & percentage share by department</p>
      </div>
      
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
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
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {totalHeadcount}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
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
                paddingAngle={3}
                cornerRadius={4}
                stroke="none"
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {data?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={MONO_COLORS[index % MONO_COLORS.length]} />
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
                        background: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        padding: '12px 16px',
                        boxShadow: '0 10px 25px -5px var(--surface)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: payload[0].payload.fill || MONO_COLORS[0] }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{itemData.department}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '18px' }}>
                          {count} Members <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>({pct}%)</span>
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
