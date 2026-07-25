
interface RangeSelectorProps {
  value: number;
  onChange: (val: number) => void;
  options: number[];
}

export function RangeSelector({ value, onChange, options }: RangeSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', background: 'var(--surface-2)', padding: '4px', borderRadius: '6px' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            background: value === opt ? 'var(--primary)' : 'transparent',
            color: value === opt ? 'white' : 'var(--text-secondary)',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
          className="hover-opacity"
        >
          {opt}d
        </button>
      ))}
    </div>
  );
}
