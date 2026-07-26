import { Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Logo({ size = 'md', showText = false }: { size?: 'sm' | 'md' | 'lg' | 'xl', showText?: boolean }) {
  const dimensions = {
    sm: { container: '24px', icon: 14, text: '0.9rem' },
    md: { container: '32px', icon: 18, text: '1.05rem' },
    lg: { container: '48px', icon: 24, text: '1.5rem' },
    xl: { container: '64px', icon: 32, text: '2rem' },
  }[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <motion.div
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: size === 'sm' ? '6px' : size === 'md' ? '8px' : '12px',
          background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        <Hexagon size={dimensions.icon} fill="currentColor" strokeWidth={1.5} />
      </motion.div>
      {showText && (
        <span style={{ fontWeight: 800, fontSize: dimensions.text, color: 'var(--text-primary)' }}>
          WorkTrail
        </span>
      )}
    </div>
  );
}
