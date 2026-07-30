import { useEffect, useRef } from 'react';

export default function AntigravityCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Class (Floating Data Cubes / Nodes)
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = Math.random() > 0.5 ? '#00FFFF' : '#7F00FF';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > width || this.x < 0) this.speedX *= -1;
        if (this.y > height || this.y < 0) this.speedY *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 70; i++) {
      particles.push(new Particle());
    }

    let time = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 16, 0.35)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1.5;

      // Cyan Wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      for (let i = 0; i < width; i++) {
        ctx.lineTo(i, height / 2 + Math.sin(i * 0.005 + time) * 150);
      }
      ctx.stroke();

      // Purple Wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(127, 0, 255, 0.3)';
      for (let i = 0; i < width; i++) {
        ctx.lineTo(i, height / 2 + Math.cos(i * 0.004 + time) * 100);
      }
      ctx.stroke();

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      time += 0.02;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
