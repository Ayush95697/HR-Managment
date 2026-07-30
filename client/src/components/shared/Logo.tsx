import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Logo({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
  onClick,
}: LogoProps) {
  const dimensions = {
    sm: { container: 26, text: '0.95rem', tagline: '0.5rem', borderRadius: '8px' },
    md: { container: 36, text: '1.25rem', tagline: '0.56rem', borderRadius: '10px' },
    lg: { container: 48, text: '1.75rem', tagline: '0.7rem', borderRadius: '14px' },
    xl: { container: 68, text: '2.8rem', tagline: '0.88rem', borderRadius: '16px' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : size === 'xl' ? '16px' : '10px',
        maxWidth: '100%',
      }}
    >
      {/* Primary Floating Cube Graphic Logo Image */}
      <motion.div
        whileHover={{ scale: 1.06, rotate: 2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        style={{
          width: dimensions.container,
          height: dimensions.container,
          flexShrink: 0,
          borderRadius: dimensions.borderRadius,
          overflow: 'hidden',
          border: '1px solid rgba(0, 255, 255, 0.5)',
          boxShadow: '0 0 16px rgba(0, 255, 255, 0.4), 0 0 12px rgba(127, 0, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090a14',
        }}
      >
        <img
          src="/worktrail_primary_logo.jpg"
          alt="WorkTrail Logo Graphic"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>

      {/* Two-tone Glowing Brand Text & Non-Overflowing Tagline */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.05, minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: dimensions.text,
              letterSpacing: '0.5px',
              fontFamily: "'Segoe UI', 'Outfit', sans-serif",
            }}
          >
            <span
              style={{
                color: '#7F00FF',
                textShadow: '0 0 14px rgba(127, 0, 255, 0.8)',
              }}
            >
              Work
            </span>
            <span
              style={{
                color: '#00FFFF',
                textShadow: '0 0 14px rgba(0, 255, 255, 0.8)',
              }}
            >
              Trail
            </span>
          </div>

          {/* Tagline Sub-text (Stacked vertically to guarantee 0 overflow) */}
          {showTagline && (
            <div
              style={{
                fontSize: dimensions.tagline,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '3px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                lineHeight: 1.1,
              }}
            >
              <span style={{ color: '#7F00FF', textShadow: '0 0 8px rgba(127, 0, 255, 0.7)', whiteSpace: 'nowrap' }}>
                FOLLOW THE WORK.
              </span>
              <span style={{ color: '#00FFFF', textShadow: '0 0 8px rgba(0, 255, 255, 0.7)', whiteSpace: 'nowrap' }}>
                TRUST THE TRAIL.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
