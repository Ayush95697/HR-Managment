import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroLayerRef = useRef<HTMLDivElement | null>(null);

  // Sequence Timed States
  const [particleActive, setParticleActive] = useState(false);
  const [waveActive, setWaveActive] = useState(false);
  const [logoReveal, setLogoReveal] = useState(false);
  const [taglineLetterIndices, setTaglineLetterIndices] = useState<number[]>([]);
  const [buttonsReveal, setButtonsReveal] = useState(false);

  const taglineText = "FOLLOW THE WORK. TRUST THE TRAIL.";

  // Choreographed Sequence Timing Controller
  useEffect(() => {
    // 0.8s: Particle field fade-in
    const t0 = setTimeout(() => setParticleActive(true), 800);

    // 1.0s: Wave motion starts
    const t1 = setTimeout(() => setWaveActive(true), 1000);

    // 1.2s: Logo reveal (fade-in + scale-up duration 1.2s, easeInOutExpo)
    const t2 = setTimeout(() => setLogoReveal(true), 1200);

    // 1.5s: Tagline staggered letter fade-in (0.05s / 50ms per letter)
    const t3 = setTimeout(() => {
      const staggerInterval = 50;
      taglineText.split('').forEach((_, idx) => {
        setTimeout(() => {
          setTaglineLetterIndices((prev) => [...prev, idx]);
        }, idx * staggerInterval);
      });
    }, 1500);

    // 2.0s: Buttons fade/slide in (1.0s duration, easeOutCubic)
    const t4 = setTimeout(() => setButtonsReveal(true), 2000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Canvas Physics, Balanced 450 Particles, 0.3Hz Wave, & 12s Ambient Drift
  useEffect(() => {
    const pCanvas = particleCanvasRef.current;
    const wCanvas = waveCanvasRef.current;
    const lCanvas = lightingCanvasRef.current;
    if (!pCanvas || !wCanvas || !lCanvas) return;

    const pCtx = pCanvas.getContext('2d');
    const wCtx = wCanvas.getContext('2d');
    const lCtx = lCanvas.getContext('2d');
    if (!pCtx || !wCtx || !lCtx) return;

    let animFrameId: number;
    let width = (pCanvas.width = wCanvas.width = lCanvas.width = window.innerWidth);
    let height = (pCanvas.height = wCanvas.height = lCanvas.height = window.innerHeight);

    const handleResize = () => {
      if (!pCanvas || !wCanvas || !lCanvas) return;
      width = pCanvas.width = wCanvas.width = lCanvas.width = window.innerWidth;
      height = pCanvas.height = wCanvas.height = lCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse & Parallax State (Gentle 5-10px depth shift)
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const parallax = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      const normX = (e.clientX - width / 2) / (width / 2);
      const normY = (e.clientY - height / 2) / (height / 2);
      parallax.targetX = normX;
      parallax.targetY = normY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle System (450 particles for clarity, size 1-2px, drift speed 0.25, z-depth 0 to 20)
    const PARTICLE_COUNT = 450;
    const particles: Particle[] = [];
    const burstParticles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      zDepth: number; // 0 to 20 mapped to 0.4 - 1.2
      color: string;
      glow: string;
      vx: number;
      vy: number;
      alpha: number;
      decay?: number;
      isBurst: boolean;

      constructor(isBurst = false, bx = 0, by = 0, colorType = 'random') {
        this.isBurst = isBurst;
        this.x = isBurst ? bx : Math.random() * width;
        this.y = isBurst ? by : Math.random() * height;

        if (isBurst) {
          this.size = 2;
          this.zDepth = 1;
        } else {
          this.size = Math.random() * 1 + 1; // 1px to 2px
          this.zDepth = (Math.random() * 20) / 20 * 0.8 + 0.4;
        }

        // Particle Colors: Cyan (#00FFFF), Violet (#9B30FF), and Faint Magenta (#FF00FF)
        const rnd = Math.random();
        if (colorType === 'cyan' || (colorType === 'random' && rnd < 0.45)) {
          this.color = '#00FFFF';
          this.glow = 'rgba(0, 255, 255, 0.6)';
        } else if (colorType === 'violet' || (colorType === 'random' && rnd < 0.85)) {
          this.color = '#9B30FF';
          this.glow = 'rgba(155, 48, 255, 0.6)';
        } else {
          this.color = '#FF00FF';
          this.glow = 'rgba(255, 0, 255, 0.4)';
        }

        if (isBurst) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.8 + 1.2;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.alpha = 1;
          this.decay = 1 / (0.8 * 60); // 0.8s fade duration
        } else {
          const driftSpeed = 0.25 * this.zDepth; // Slow drift speed 0.25
          this.vx = (Math.random() - 0.5) * driftSpeed;
          this.vy = (Math.random() - 0.5) * driftSpeed;
          this.alpha = Math.random() * 0.5 + 0.3; // Glow intensity 0.6 balanced
        }
      }

      update() {
        if (this.isBurst) {
          this.x += this.vx;
          this.y += this.vy;
          this.vx *= 0.94;
          this.vy *= 0.94;
          if (this.decay) this.alpha -= this.decay;
        } else {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120 * this.zDepth;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 0.6;
            this.x -= (dx / dist) * force * 1.1;
            this.y -= (dy / dist) * force * 1.1;
          }

          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;
          if (this.y < 0) this.y = height;
          if (this.y > height) this.y = 0;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glow;
        ctx.shadowBlur = this.size * 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.zDepth, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    // Button Hover Particle Burst Callback (10 particles, 2px size, 0.8s fade)
    (window as any).__triggerWorkTrailBurst = (e: MouseEvent, colorType: string) => {
      const target = e.currentTarget as HTMLElement;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      for (let i = 0; i < 10; i++) {
        burstParticles.push(new Particle(true, bx, by, colorType));
      }
    };

    // Soft Ambient Glow Lighting Layer (Cyan #00FFFF + Violet #9B30FF)
    const drawLightingOverlay = (t: number) => {
      lCtx.clearRect(0, 0, width, height);
      lCtx.save();
      lCtx.globalAlpha = 0.7; // Bloom 0.7

      const angle = t * 0.00025;
      const cx = width / 2 + Math.cos(angle) * (width * 0.2);
      const cy = height / 2 + Math.sin(angle * 0.6) * (height * 0.15);

      const lightGrad = lCtx.createRadialGradient(cx, cy, 40, width / 2, height / 2, Math.max(width, height) * 0.7);
      lightGrad.addColorStop(0, 'rgba(0, 255, 255, 0.12)'); // Cyan
      lightGrad.addColorStop(0.6, 'rgba(155, 48, 255, 0.08)'); // Violet
      lightGrad.addColorStop(1, 'rgba(10, 0, 32, 0.02)');

      lCtx.fillStyle = lightGrad;
      lCtx.fillRect(0, 0, width, height);
      lCtx.restore();
    };

    // Wave Layer (Amplitude 20px, Frequency 0.3Hz, Blur 6px, Opacity 0.5)
    let waveTime = 0;
    const waveFrequency = 0.3;
    const waveAmplitude = 20;

    const drawFluidWave = () => {
      wCtx.clearRect(0, 0, width, height);
      wCtx.save();
      wCtx.globalAlpha = 0.5;
      waveTime += 0.016;

      const strokeGrad = wCtx.createLinearGradient(0, height, width, 0);
      strokeGrad.addColorStop(0, 'rgba(0, 255, 255, 0.45)');
      strokeGrad.addColorStop(1, 'rgba(155, 48, 255, 0.45)');

      const fillGrad = wCtx.createLinearGradient(0, height, width, 0);
      fillGrad.addColorStop(0, 'rgba(0, 255, 255, 0.06)');
      fillGrad.addColorStop(0.7, 'rgba(155, 48, 255, 0.08)');
      fillGrad.addColorStop(1, 'rgba(10, 0, 32, 0.02)');

      wCtx.filter = 'blur(6px)'; // Blur radius 6px

      wCtx.fillStyle = fillGrad;
      wCtx.strokeStyle = strokeGrad;
      wCtx.lineWidth = 2;

      wCtx.beginPath();
      wCtx.moveTo(0, height);
      const waveYBase = height * 0.65;
      for (let x = 0; x <= width; x += 10) {
        const angle = x * 0.003 + waveTime * waveFrequency * Math.PI * 2;
        const y = waveYBase + Math.sin(angle) * waveAmplitude + Math.cos(angle * 0.5) * 6;
        wCtx.lineTo(x, y);
      }
      wCtx.lineTo(width, height);
      wCtx.closePath();
      wCtx.fill();
      wCtx.stroke();

      wCtx.restore();
    };

    // Ambient Camera Drift (x ±4px, y ±2px, loopDuration 12s)
    let ambientTime = 0;

    const render = (time: number) => {
      ambientTime += 0.016;
      const ambientX = Math.sin((ambientTime / 12) * Math.PI * 2) * 4; // ±4px
      const ambientY = Math.cos((ambientTime / 12) * Math.PI * 2) * 2; // ±2px

      // Lerp mouse & parallax (Gentle 5-10px shift)
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      parallax.currentX += (parallax.targetX - parallax.currentX) * 0.05;
      parallax.currentY += (parallax.targetY - parallax.currentY) * 0.05;

      const totalParallaxX = parallax.currentX * 8 + ambientX;
      const totalParallaxY = parallax.currentY * 8 + ambientY;

      // Parallax shift across layers
      pCanvas.style.transform = `translate3d(${totalParallaxX * -0.4}px, ${totalParallaxY * -0.4}px, 0)`;
      wCanvas.style.transform = `translate3d(${totalParallaxX * -0.6}px, ${totalParallaxY * -0.6}px, 0)`;
      lCanvas.style.transform = `translate3d(${totalParallaxX * -0.2}px, ${totalParallaxY * -0.2}px, 0)`;
      if (heroLayerRef.current) {
        heroLayerRef.current.style.transform = `translate3d(${totalParallaxX * 0.7}px, ${totalParallaxY * 0.7}px, 0)`;
      }

      drawLightingOverlay(time);

      pCtx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(pCtx);
      });

      for (let i = burstParticles.length - 1; i >= 0; i--) {
        burstParticles[i].update();
        burstParticles[i].draw(pCtx);
        if (burstParticles[i].alpha <= 0) {
          burstParticles.splice(i, 1);
        }
      }

      drawFluidWave();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId);
      delete (window as any).__triggerWorkTrailBurst;
    };
  }, []);

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, colorType: string) => {
    if (typeof (window as any).__triggerWorkTrailBurst === 'function') {
      (window as any).__triggerWorkTrailBurst(e.nativeEvent, colorType);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        /* Radial gradient background from #050510 (center) to #0A0020 (edges) */
        background:
          'radial-gradient(circle at 50% 45%, #050510 0%, #080318 60%, #0A0020 100%)',
        color: '#F8FAFC',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 1. Lighting Layer (Soft Ambient Glow Cyan #00FFFF & Violet #9B30FF) */}
      <canvas
        ref={lightingCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* 2. Canvas 1: 450 Particles (1-2px, Glow 0.6, Drift 0.25, z-Depth 0-20) */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
          opacity: particleActive ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out',
          willChange: 'transform',
        }}
      />

      {/* 3. Canvas 2: Translucent Sine Wave (Amplitude 20px, Frequency 0.3Hz, Blur 6px) */}
      <canvas
        ref={waveCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          pointerEvents: 'none',
          opacity: waveActive ? 0.5 : 0,
          transition: 'opacity 1s ease-in-out',
          willChange: 'transform',
        }}
      />

      {/* 4. Vignette Post-Processing Overlay (Opacity 0.25) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(10, 0, 32, 0.25) 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* 5. HERO CONTENT LAYER (Parallax Depth 5-10px + 12s Ambient Drift) */}
      <main
        ref={heroLayerRef}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '900px',
          willChange: 'transform',
        }}
      >
        {/* LOGO REVEAL & PULSE: Bold sans-serif, glowing cyan #00FFFF with inner white core #FFFFFF, neon outline pulse (1.0 -> 1.05 every 2s) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            marginBottom: '1.5rem',
            opacity: logoReveal ? 1 : 0,
            transform: logoReveal ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 1.2s cubic-bezier(0.87, 0, 0.13, 1), transform 1.2s cubic-bezier(0.87, 0, 0.13, 1)',
          }}
        >
          {/* Logo Icon with Neon Outline Pulse */}
          <div
            className="logo-icon-pulse"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(0, 255, 255, 0.05)',
              border: '2px solid #00FFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              animation: 'logoPulse 2.0s ease-in-out infinite alternate',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 17L10 11L14 15L20 7" stroke="#00FFFF" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="4" cy="17" r="2" fill="#00FFFF" />
              <circle cx="10" cy="11" r="2" fill="#00FFFF" />
              <circle cx="14" cy="15" r="2" fill="#9B30FF" />
              <circle cx="20" cy="7" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '4.25rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#FFFFFF', // Inner white core
              WebkitTextStroke: '1.5px #00FFFF', // Glowing cyan outline
              textShadow:
                '0 0 8px #FFFFFF, 0 0 18px #00FFFF, 0 0 35px rgba(0, 255, 255, 0.7), 0 0 60px rgba(0, 255, 255, 0.3)',
              margin: 0,
            }}
          >
            WorkTrail
          </h1>
        </div>

        {/* TAGLINE: "FOLLOW THE WORK. TRUST THE TRAIL.", Color #B266FF, letter spacing 0.1em, staggered 0.05s, translateY(-10px) */}
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#B266FF',
            textShadow: '0 0 12px rgba(178, 102, 255, 0.6), 0 0 25px rgba(178, 102, 255, 0.35)',
            marginBottom: '3.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 0,
            minHeight: '2rem',
          }}
          aria-label={taglineText}
        >
          {taglineText.split('').map((char, index) => {
            const isVisible = taglineLetterIndices.includes(index);
            return (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(-10px)' : 'translateY(10px)',
                  transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'pre',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>

        {/* BUTTONS: Slide-up + Opacity Transition (1.0s, easeOutCubic) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.75rem',
            opacity: buttonsReveal ? 1 : 0,
            transform: buttonsReveal ? 'translateY(0)' : 'translateY(25px)',
            transition: 'opacity 1.0s cubic-bezier(0.215, 0.61, 0.355, 1), transform 1.0s cubic-bezier(0.215, 0.61, 0.355, 1)',
          }}
        >
          {/* Button 1: Solid Cyan "Login" Button (backgroundColor: #00FFFF, hoverGlow: 1.2, shadowBlur: 10px) */}
          <button
            onClick={() => navigate('/login')}
            onMouseEnter={(e) => handleButtonHover(e, 'cyan')}
            style={{
              position: 'relative',
              padding: '0.9375rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              color: '#000000',
              backgroundColor: '#00FFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
            }}
            className="btn-login-hover"
          >
            Login
          </button>

          {/* Button 2: Outlined Violet "Start Trail" Button (borderColor: #9B30FF, hoverUnderline: true) */}
          <button
            onClick={() => navigate('/login')}
            onMouseEnter={(e) => handleButtonHover(e, 'violet')}
            style={{
              position: 'relative',
              padding: '0.9375rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              color: '#FFFFFF',
              background: 'rgba(155, 48, 255, 0.05)',
              border: '1.5px solid #9B30FF',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(155, 48, 255, 0.2)',
              backdropFilter: 'blur(6px)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            }}
            className="btn-start-trail-hover"
          >
            Start Trail
          </button>
        </div>
      </main>

      {/* CSS Keyframes for Pulse & Hover States */}
      <style>{`
        @keyframes logoPulse {
          0% {
            transform: scale(1.0);
            box-shadow: 0 0 18px rgba(0, 255, 255, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.8);
          }
          100% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.85), inset 0 0 18px rgba(255, 255, 255, 1.0);
          }
        }

        .btn-login-hover:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 25px rgba(0, 255, 255, 0.9), 0 0 50px rgba(0, 255, 255, 0.5) !important;
        }

        .btn-start-trail-hover {
          position: relative;
        }

        .btn-start-trail-hover::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          width: 0%;
          height: 2px;
          background: #9B30FF;
          box-shadow: 0 0 8px #9B30FF;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform: translateX(-50%);
        }

        .btn-start-trail-hover:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: #D8B4FE !important;
          box-shadow: 0 0 22px rgba(155, 48, 255, 0.55) !important;
        }

        .btn-start-trail-hover:hover::after {
          width: 70%;
        }
      `}</style>
    </div>
  );
}
