interface SpinnerProps {
  size?: number;
  color?: string;
}

export default function Spinner({ size = 24, color = 'var(--accent, #3B82F6)' }: SpinnerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}33`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}
