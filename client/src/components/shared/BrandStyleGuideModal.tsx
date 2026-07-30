import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Layers, Palette, Eye, Layout, CheckCircle2, Copy } from 'lucide-react';
import Logo from './Logo';

interface BrandStyleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandStyleGuideModal({ isOpen, onClose }: BrandStyleGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'components' | 'palette'>('board');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 6, 12, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '92vh',
            backgroundColor: 'rgba(9, 10, 20, 0.95)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 255, 255, 0.25), inset 0 0 20px rgba(127, 0, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 28px',
              borderBottom: '1px solid rgba(0, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(127,0,255,0.15) 0%, rgba(0,255,255,0.1) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Logo size="md" showText={false} />
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#00FFFF',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textShadow: '0 0 15px rgba(0, 255, 255, 0.6)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  WORKTRAIL BRAND STYLE GUIDE
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#c084fc', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
                  THE 'ANTIGRAVITY CODE' VISUAL SYSTEM & PRESENTATION BOARD
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setActiveTab('board')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: activeTab === 'board' ? '1px solid #00FFFF' : '1px solid transparent',
                  background: activeTab === 'board' ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
                  color: activeTab === 'board' ? '#00FFFF' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Eye size={16} />
                Presentation Board
              </button>

              <button
                onClick={() => setActiveTab('components')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: activeTab === 'components' ? '1px solid #00FFFF' : '1px solid transparent',
                  background: activeTab === 'components' ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
                  color: activeTab === 'components' ? '#00FFFF' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Layout size={16} />
                UI Components
              </button>

              <button
                onClick={() => setActiveTab('palette')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: activeTab === 'palette' ? '1px solid #00FFFF' : '1px solid transparent',
                  background: activeTab === 'palette' ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
                  color: activeTab === 'palette' ? '#00FFFF' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Palette size={16} />
                Color Swatches
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {activeTab === 'board' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Full Presentation Board Image */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 255, 255, 0.25)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
                  <img
                    src="/worktrail_style_guide.jpg"
                    alt="WorkTrail Brand Style Guide Presentation Board"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>

                {/* Grid details of the 4 Panels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {/* Panel 1: Primary Logo */}
                  <div className="data-card-worktrail">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Sparkles size={18} color="#00FFFF" />
                      <h3 style={{ margin: 0, fontSize: '1rem', color: '#00FFFF', fontWeight: 700, letterSpacing: '0.05em' }}>
                        PANEL 1: PRIMARY LOGO
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Displays the refined WorkTrail mark: interwoven glowing <strong>Deep Purple (#7F00FF)</strong> and <strong>Radiant Cyan (#00FFFF)</strong> filaments wave, floating crystalline data cubes, the signature two-tone <strong>WorkTrail</strong> logo text, and tagline:
                    </p>
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(0, 255, 255, 0.08)', borderRadius: '8px', border: '1px stroke rgba(0,255,255,0.3)', fontSize: '0.78rem', color: '#00FFFF', fontWeight: 700, letterSpacing: '0.12em', textAlign: 'center' }}>
                      "FOLLOW THE WORK. TRUST THE TRAIL."
                    </div>
                  </div>

                  {/* Panel 2: The Antigravity Code Visual System */}
                  <div className="data-card-worktrail">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Layers size={18} color="#c084fc" />
                      <h3 style={{ margin: 0, fontSize: '1rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.05em' }}>
                        PANEL 2: 'ANTIGRAVITY CODE' VISUAL SYSTEM
                      </h3>
                    </div>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li><strong>Flow Path Filaments:</strong> Interwoven glowing line patterns for borders & path indicators.</li>
                      <li><strong>Data Cubes:</strong> Floating geometric 3D data nodes for background accents.</li>
                      <li><strong>Color Palette:</strong> Deep Purple (#7F00FF) and Radiant Cyan (#00FFFF).</li>
                    </ul>
                  </div>

                  {/* Panel 3: UI Application Samples */}
                  <div className="data-card-worktrail">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Layout size={18} color="#00FFFF" />
                      <h3 style={{ margin: 0, fontSize: '1rem', color: '#00FFFF', fontWeight: 700, letterSpacing: '0.05em' }}>
                        PANEL 3: UI APPLICATION SAMPLES
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interactive Button:</span>
                        <button className="btn-worktrail-interactive" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                          Start Trail
                        </button>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cube Progress Meter:</span>
                        <div className="progress-meter-cubes">
                          <div className="progress-cube active-purple"></div>
                          <div className="progress-cube active-cyan"></div>
                          <div className="progress-cube active-purple"></div>
                          <div className="progress-cube active-cyan"></div>
                          <div className="progress-cube"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel 4: Background Theme */}
                  <div className="data-card-worktrail">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Palette size={18} color="#c084fc" />
                      <h3 style={{ margin: 0, fontSize: '1rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.05em' }}>
                        PANEL 4: BACKGROUND THEME
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Dark geometric network grid mesh defining the application's base background pattern, with subtle glowing light nodes acting as live data points across all modules.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'components' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ margin: 0, color: '#00FFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                  WorkTrail Live UI Component Library
                </h3>

                <div className="grid-2">
                  {/* 1. Interactive Button */}
                  <div className="data-card-worktrail">
                    <h4 style={{ color: '#00FFFF', marginBottom: '12px', fontSize: '0.95rem' }}>1. Interactive Button (Glowing Filigree Border)</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button className="btn-worktrail-interactive">
                        Start Trail
                      </button>
                      <button className="btn-worktrail-interactive" style={{ background: 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(127,0,255,0.4) 100%)' }}>
                        Explore Data
                      </button>
                    </div>
                  </div>

                  {/* 2. Progress Meter */}
                  <div className="data-card-worktrail">
                    <h4 style={{ color: '#00FFFF', marginBottom: '12px', fontSize: '0.95rem' }}>2. Data Cube Progress Meter</h4>
                    <div className="progress-meter-cubes" style={{ marginBottom: '8px' }}>
                      <div className="progress-cube active-purple"></div>
                      <div className="progress-cube active-cyan"></div>
                      <div className="progress-cube active-purple"></div>
                      <div className="progress-cube active-cyan"></div>
                      <div className="progress-cube active-cyan"></div>
                      <div className="progress-cube"></div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#00FFFF' }}>83% Trail Synchronized</span>
                  </div>

                  {/* 3. Primary Logo Showcase */}
                  <div className="data-card-worktrail">
                    <h4 style={{ color: '#00FFFF', marginBottom: '12px', fontSize: '0.95rem' }}>3. Two-Tone Brand Logo</h4>
                    <Logo size="xl" showText={true} showTagline={true} />
                  </div>

                  {/* 4. Standalone Logo Graphic */}
                  <div className="data-card-worktrail">
                    <h4 style={{ color: '#00FFFF', marginBottom: '12px', fontSize: '0.95rem' }}>4. High-Res Logo Asset</h4>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', width: '140px', height: '140px', border: '1px solid rgba(0,255,255,0.3)' }}>
                      <img src="/worktrail_primary_logo.jpg" alt="WorkTrail Primary Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'palette' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ margin: 0, color: '#00FFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                  WorkTrail Color Swatches
                </h3>

                <div className="grid-3">
                  {/* Swatch 1: Deep Purple */}
                  <div className="data-card-worktrail" style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '100px',
                        borderRadius: '12px',
                        backgroundColor: '#7F00FF',
                        boxShadow: '0 0 20px rgba(127, 0, 255, 0.7)',
                        marginBottom: '12px',
                      }}
                    />
                    <h4 style={{ color: '#ffffff', margin: '0 0 4px', fontSize: '1rem' }}>Deep Purple</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <code style={{ background: 'rgba(0,0,0,0.5)', color: '#c084fc' }}>#7F00FF</code>
                      <button onClick={() => copyToClipboard('#7F00FF')} style={{ background: 'none', border: 'none', color: '#00FFFF', cursor: 'pointer' }}>
                        {copiedHex === '#7F00FF' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Swatch 2: Radiant Cyan */}
                  <div className="data-card-worktrail" style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '100px',
                        borderRadius: '12px',
                        backgroundColor: '#00FFFF',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.7)',
                        marginBottom: '12px',
                      }}
                    />
                    <h4 style={{ color: '#ffffff', margin: '0 0 4px', fontSize: '1rem' }}>Radiant Cyan</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <code style={{ background: 'rgba(0,0,0,0.5)', color: '#00FFFF' }}>#00FFFF</code>
                      <button onClick={() => copyToClipboard('#00FFFF')} style={{ background: 'none', border: 'none', color: '#00FFFF', cursor: 'pointer' }}>
                        {copiedHex === '#00FFFF' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Swatch 3: Dark Geometric Mesh */}
                  <div className="data-card-worktrail" style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '100px',
                        borderRadius: '12px',
                        backgroundColor: '#090a14',
                        border: '1px stroke rgba(0, 255, 255, 0.3)',
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
                        marginBottom: '12px',
                      }}
                    />
                    <h4 style={{ color: '#ffffff', margin: '0 0 4px', fontSize: '1rem' }}>Base Mesh Background</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <code style={{ background: 'rgba(0,0,0,0.5)', color: '#cbd5e1' }}>#090A14</code>
                      <button onClick={() => copyToClipboard('#090A14')} style={{ background: 'none', border: 'none', color: '#00FFFF', cursor: 'pointer' }}>
                        {copiedHex === '#090A14' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
