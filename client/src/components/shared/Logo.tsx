import { motion } from 'framer-motion';

export default function Logo({ size = 'md', showText = false }: { size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl', showText?: boolean }) {
  // Reduced icon size by ~15% from previous values
  const dimensions = {
    sm: { container: 20, text: '0.9rem', gap: '8px' },
    md: { container: 28, text: '1.05rem', gap: '10px' },
    lg: { container: 42, text: '1.5rem', gap: '12px' },
    xl: { container: 54, text: '2rem', gap: '16px' },
    xxl: { container: 88, text: '3rem', gap: '24px' },
  }[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: dimensions.gap }}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: dimensions.container,
          height: dimensions.container,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg 
          viewBox="0 0 32 32" 
          width="100%" 
          height="100%" 
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />   {/* Blue */}
              <stop offset="50%" stopColor="#4F46E5" />  {/* Indigo */}
              <stop offset="100%" stopColor="#8B5CF6" /> {/* Violet */}
            </linearGradient>
          </defs>
          
          {/* Rounded Box with Premium Blue->Indigo->Violet Gradient */}
          <rect 
            x="0" 
            y="0" 
            width="32" 
            height="32" 
            rx="8" 
            fill="url(#brandGrad)" 
            filter="drop-shadow(0 4px 6px rgba(79, 70, 229, 0.25))"
          />
          
          {/* Thick White 'W + Trail' Concept */}
          <path 
            d="M 7 11 L 12 21 L 16 14 L 20 21 L 25 10" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
          />
          {/* Subtle destination node */}
          <circle cx="25" cy="10" r="2.5" fill="#FFFFFF" />
        </svg>
      </motion.div>
      
      {showText && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontFamily: '"Outfit", "Plus Jakarta Sans", "Manrope", sans-serif',
          fontWeight: 800, 
          fontSize: dimensions.text,
          letterSpacing: '0.03em', // Slightly increased letter spacing
          lineHeight: 1,
          marginTop: '1px' // Align perfectly with the icon
        }}>
          {/* Work: Dark Navy (Light) / White (Dark) handled by --text-primary */}
          <span style={{ color: 'var(--text-primary)' }}>Work</span>
          
          {/* Trail: Blue Gradient */}
          <span style={{ 
            background: 'linear-gradient(135deg, #3B82F6, #4F46E5, #8B5CF6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Trail
          </span>
        </div>
      )}
    </div>
  );
}
