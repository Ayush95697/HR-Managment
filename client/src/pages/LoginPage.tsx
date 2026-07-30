import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

import { cn } from '../lib/utils';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';
import { loginSchema, type LoginFormData } from '../types/schemas';
import Button from '../components/shared/Button';
import ErrorBanner from '../components/shared/ErrorBanner';
import Logo from '../components/shared/Logo';

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('Employee');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // For 3D card tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Antigravity Canvas Particle & Sine Wave Animation (Same theme as Landing Page)
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
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    let time = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 16, 0.3)';
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

  const from = '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      const res = await authApi.login(data);
      const decoded = jwtDecode<any>(res.accessToken);
      const actualRole = (decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee') as Role;
      
      if (actualRole !== selectedRole) {
        setErrorMsg(`Access Denied: You are attempting to login as ${selectedRole}, but this account is registered as an ${actualRole}.`);
        return;
      }

      setToken(res.accessToken);
      queryClient.clear();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setErrorMsg(apiErr?.message || 'Invalid email or password');
    }
  };

  const onError = (errors: any) => {
    console.error('Validation errors:', errors);
  };
  
  const quickFill = (email: string, role: Role) => {
    setSelectedRole(role);
    setValue('email', email, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('password', atob('QWRtaW4xMjMh'), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#050510]">
      {/* Antigravity Canvas Animation (Same as Landing Page) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[460px] relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card hover border glow effect */}
            <motion.div 
              className="absolute -inset-[1.5px] rounded-[20px] opacity-70 transition-opacity duration-700 pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 20px 2px rgba(0, 255, 255, 0.3)",
                  "0 0 35px 5px rgba(127, 0, 255, 0.5)",
                  "0 0 20px 2px rgba(0, 255, 255, 0.3)"
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />

            {/* Glassmorphism Card */}
            <div className="relative bg-[#090a14]/85 backdrop-blur-2xl rounded-2xl p-[36px] sm:px-[44px] border border-[#00FFFF]/20 shadow-2xl overflow-hidden">
              
              {/* Subtle grid texture overlay */}
              <div 
                className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-2xl" 
                style={{
                  backgroundImage: `linear-gradient(135deg, #00FFFF 1px, transparent 1px), linear-gradient(45deg, #7F00FF 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />

              <div className="relative z-10">
                {/* WorkTrail Primary Brand Logo Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <Logo size="lg" showText={true} showTagline={true} />
                  </div>

                  {/* Vibrant Color Subtitle Text */}
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: '#00FFFF',
                      marginTop: '6px',
                      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Enter your credentials to access your WorkTrail dashboard
                  </p>
                </div>

                {errorMsg && <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

                {/* Role Selection */}
                <div style={{ marginBottom: '22px' }}>
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '10px', color: '#00FFFF', fontWeight: 600 }}>
                    Select Portal Role
                  </label>
                  <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(0, 255, 255, 0.15)' }}>
                    {(['Admin', 'HR', 'Employee'] as Role[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          border: selectedRole === role ? '1px solid #00FFFF' : '1px solid transparent',
                          background: selectedRole === role ? 'linear-gradient(135deg, rgba(127,0,255,0.7) 0%, rgba(0,255,255,0.4) 100%)' : 'transparent',
                          color: selectedRole === role ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                          fontWeight: selectedRole === role ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: selectedRole === role ? '0 0 14px rgba(0, 255, 255, 0.3)' : 'none',
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit, onError)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Email input */}
                  <div>
                    <motion.div 
                      className={`relative ${focusedInput === "email" ? 'z-20' : ''}`}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-xl">
                        <Mail className={`absolute left-3.5 w-5 h-5 transition-all duration-300 ${focusedInput === "email" ? 'text-[#00FFFF]' : 'text-white/40'}`} />
                        
                        <Input
                          type="email"
                          placeholder="Email address"
                          {...register('email')}
                          onFocus={(e) => { setFocusedInput("email"); e.target.select(); }}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-white/5 border-white/10 focus:border-[#00FFFF] text-white placeholder:text-white/30 h-12 transition-all duration-300 focus:bg-white/10 text-sm rounded-xl"
                          style={{ paddingLeft: '44px', paddingRight: '16px' }}
                        />
                      </div>
                    </motion.div>
                    {errors.email && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Password input */}
                  <div>
                    <motion.div 
                      className={`relative ${focusedInput === "password" ? 'z-20' : ''}`}
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-xl">
                        <Lock className={`absolute left-3.5 w-5 h-5 transition-all duration-300 ${focusedInput === "password" ? 'text-[#00FFFF]' : 'text-white/40'}`} />
                        
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          {...register('password')}
                          onFocus={(e) => { setFocusedInput("password"); e.target.select(); }}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-white/5 border-white/10 focus:border-[#00FFFF] text-white placeholder:text-white/30 h-12 transition-all duration-300 focus:bg-white/10 text-sm rounded-xl"
                          style={{ paddingLeft: '44px', paddingRight: '44px' }}
                        />
                        
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 cursor-pointer p-1 bg-transparent border-none"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} className="text-white/40 hover:text-white transition-colors" /> : <Eye size={18} className="text-white/40 hover:text-white transition-colors" />}
                        </button>
                      </div>
                    </motion.div>
                    {errors.password && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* WorkTrail Interactive Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-worktrail-interactive w-full py-3 mt-2 text-base"
                    style={{
                      background: 'linear-gradient(135deg, #7F00FF 0%, #00FFFF 100%)',
                      border: '1px solid #00FFFF',
                      borderRadius: '9999px',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <LogIn size={18} />
                    <span>{isSubmitting ? 'Signing in...' : 'Start Trail — Sign In'}</span>
                  </button>
                </form>

                {/* Quick Fill Demo Roles */}
                <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(0, 255, 255, 0.12)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginBottom: '10px' }}>
                    Quick-fill demo account:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('admin@hrsystem.com', 'Admin')} style={{ color: '#00FFFF', borderColor: 'rgba(0,255,255,0.2)' }}>
                      Admin
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('hr@hrsystem.com', 'HR')} style={{ color: '#00FFFF', borderColor: 'rgba(0,255,255,0.2)' }}>
                      HR
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('employee@hrsystem.com', 'Employee')} style={{ color: '#00FFFF', borderColor: 'rgba(0,255,255,0.2)' }}>
                      Employee
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
