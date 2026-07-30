import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Mouse interaction for parallax
    let mouse = { x: width / 2, y: height / 2 };
    let targetMouse = { x: width / 2, y: height / 2 };
    
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      pulse: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5 - 0.2; // slight upward drift
        this.radius = Math.random() * 2.5 + 0.5;
        const colors = ['#3B82F6', '#06B6D4', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.02;

        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;
      }

      draw() {
        if (!ctx) return;
        const currentAlpha = this.alpha + Math.sin(this.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0.05, currentAlpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }
    }

    let particles: Particle[] = [];
    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor((width * height) / 15000), 100);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    let time = 0;

    const animate = () => {
      time += 0.005;
      
      // Smooth mouse follow
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      // Draw background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Parallax offsets
      const px = (mouse.x - width / 2) * 0.05;
      const py = (mouse.y - height / 2) * 0.05;

      // Draw large moving blobs (Layer 2 & 3 equivalent)
      const drawBlob = (x: number, y: number, r: number, color1: string, color2: string) => {
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        ctx.fillStyle = grd;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, width, height);
      };

      // Blob 1 (Blue)
      const b1x = width * 0.3 + Math.sin(time) * 300 - px * 1.5;
      const b1y = height * 0.4 + Math.cos(time * 0.8) * 200 - py * 1.5;
      drawBlob(b1x, b1y, 800, 'rgba(37, 99, 235, 0.15)', 'transparent');

      // Blob 2 (Cyan)
      const b2x = width * 0.7 + Math.cos(time * 1.2) * 350 + px * 1.2;
      const b2y = height * 0.6 + Math.sin(time * 0.9) * 250 + py * 1.2;
      drawBlob(b2x, b2y, 700, 'rgba(6, 182, 212, 0.15)', 'transparent');

      // Central Spotlight
      const cx = width / 2;
      const cy = height / 2;
      drawBlob(cx, cy, 600 + Math.sin(time * 2) * 50, 'rgba(59, 130, 246, 0.08)', 'transparent');

      // Cursor Glow
      drawBlob(mouse.x, mouse.y, 400, 'rgba(59, 130, 246, 0.08)', 'transparent');

      // Draw Particles
      ctx.globalCompositeOperation = 'source-over';
      particles.forEach(p => {
        p.update();
        // Add subtle parallax to particle drawing position
        const origX = p.x;
        const origY = p.y;
        p.x -= px * 0.5 * (p.radius * 0.5);
        p.y -= py * 0.5 * (p.radius * 0.5);
        p.draw();
        p.x = origX;
        p.y = origY;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: 'block', background: '#0F172A' }}
    />
  );
}
