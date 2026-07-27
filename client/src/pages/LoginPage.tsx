import React, { useState } from 'react';
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
  )
}

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('Employee');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // For 3D card effect
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
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[420px] relative z-10"
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
              className="absolute -inset-[1px] rounded-[14px] opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(255,255,255,0.03)",
                  "0 0 15px 5px rgba(255,255,255,0.05)",
                  "0 0 10px 2px rgba(255,255,255,0.03)"
                ],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />

            {/* Traveling light beam effect */}
            <div className="absolute -inset-[1px] rounded-[14px] overflow-hidden pointer-events-none">
              <motion.div className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" } }} />
              <motion.div className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }} />
              <motion.div className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }} />
              <motion.div className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(2px)" }} animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }} transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }} />
              <motion.div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }} />
              <motion.div className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }} />
              <motion.div className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }} />
              <motion.div className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }} />
            </div>

            {/* Static Card border glow */}
            <div className="absolute -inset-[0.5px] rounded-[14px] bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
            
            {/* The old login form inside the new glassmorphism card */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-xl p-[48px] sm:px-[64px] border border-white/[0.05] shadow-2xl">
              
              {/* Subtle card inner patterns */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-xl" 
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Added padding here to give margin inside the card to fields, buttons, etc. */}
              <div className="relative z-10" style={{ padding: '0 20px' }}>
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                    <Logo size="lg" showText={false} />
                  </div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    Welcome to WorkTrail
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Follow the work. Trust the trail.
                  </p>
                </div>

                {errorMsg && <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

                {/* Role Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    Login As
                  </label>
                  <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: 'var(--radius-lg, 12px)' }}>
                    {(['Admin', 'HR', 'Employee'] as Role[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--radius-md, 8px)',
                          border: 'none',
                          backgroundColor: selectedRole === role ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                          color: selectedRole === role ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                          fontWeight: selectedRole === role ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: selectedRole === role ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
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
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Mail className={`absolute left-3 w-5 h-5 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'}`} />
                        
                        <Input
                          type="email"
                          placeholder="Email address"
                          {...register('email')}
                          onFocus={(e) => { setFocusedInput("email"); e.target.select(); }}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-12 transition-all duration-300 focus:bg-white/10 text-sm"
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
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Lock className={`absolute left-3 w-5 h-5 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'}`} />
                        
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          {...register('password')}
                          onFocus={(e) => { setFocusedInput("password"); e.target.select(); }}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-12 transition-all duration-300 focus:bg-white/10 text-sm"
                          style={{ paddingLeft: '44px', paddingRight: '44px' }}
                        />
                        
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 cursor-pointer p-1 bg-transparent border-none"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={20} className="text-white/40 hover:text-white transition-colors" /> : <Eye size={20} className="text-white/40 hover:text-white transition-colors" />}
                        </button>
                      </div>
                    </motion.div>
                    {errors.password && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  <Button type="submit" isLoading={isSubmitting} leftIcon={<LogIn size={16} />} style={{ width: '100%', marginTop: '6px', background: '#ffffff', color: '#000000', borderRadius: '9999px', border: 'none' }}>
                    Sign In
                  </Button>
                </form>

                {/* Quick Fill Demo Roles */}
                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginBottom: '10px' }}>
                    Quick-fill demo account:
                  </span>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('admin@hrsystem.com', 'Admin')} style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      Admin
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('hr@hrsystem.com', 'HR')} style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      HR
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('employee@hrsystem.com', 'Employee')} style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
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
