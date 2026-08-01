import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import {
  Eye, EyeOff, LogIn, Mail, Lock,
  LayoutDashboard, Users, ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '../lib/utils';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';
import { loginSchema, type LoginFormData } from '../types/schemas';
import Button from '../components/shared/Button';
import ErrorBanner from '../components/shared/ErrorBanner';
import Logo from '../components/shared/Logo';
import { TaskBoardCard, TeamCard, AnalyticsCard } from '../components/DashboardPreviewCard';
import styles from './LoginPage.module.css';

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

  // ─── Feature rows data ────────────────────────────────────────────────────
  const features = [
    {
      icon: <LayoutDashboard size={20} aria-hidden="true" />,
      label: 'Real-time Kanban boards',
      desc: 'Track sprint and project progress live',
    },
    {
      icon: <Users size={20} aria-hidden="true" />,
      label: 'Role-based dashboards',
      desc: 'Admin, HR, and Employee each see exactly what they need',
    },
    {
      icon: <Mail size={20} aria-hidden="true" />,
      label: 'One-click email center',
      desc: 'Reach any employee instantly, fully logged',
    },
    {
      icon: <ShieldCheck size={20} aria-hidden="true" />,
      label: 'Full audit trail',
      desc: 'Every board move and action is tracked',
    },
  ];

  return (
    <div className={styles.page}>

      {/* ── BACKGROUND LAYER (Single continuous scene) ──────────────────── */}
      <div className={styles.backgroundLayer} aria-hidden="true">
        {/* Gradient glows */}
        <div className={styles.primaryGlow} />
        <div className={styles.secondaryGlow} />

        {/* Ambient dashboard preview cards */}
        <div className={styles.ambientCardsWrap}>
          <div className={`${styles.ambientCard} ${styles.ambientCard1}`}>
            <TaskBoardCard variant="ambient" />
          </div>
          <div className={`${styles.ambientCard} ${styles.ambientCard2}`}>
            <TeamCard variant="ambient" />
          </div>
          <div className={`${styles.ambientCard} ${styles.ambientCard3}`}>
            <AnalyticsCard variant="ambient" />
          </div>
        </div>
      </div>

      {/* ── FOREGROUND CONTENT LAYER ────────────────────────────────────── */}
      <div className={styles.contentLayer}>
        <div className={styles.glowContainer}>
          <div className={styles.mainContainer}>
            
            {/* ── LEFT SIDE: Login form ───────────────────────────────────── */}
            <div className={styles.formSection}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={styles.formWrap}
              >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '28px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <Logo size="lg" showText={false} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F5F5F7', margin: '0 0 6px' }}>
                Welcome to WorkTrail
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#A0A0AA' }}>
                Follow the work. Trust the trail.
              </p>
            </div>

            {errorMsg && <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

            {/* Role Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '12px', color: '#A0A0AA' }}>
                Login As
              </label>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: 'var(--radius-lg, 12px)' }}>
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
                      background: selectedRole === role ? 'linear-gradient(135deg, #6C63FF, #8B7CF6)' : 'transparent',
                      color: selectedRole === role ? '#ffffff' : '#A0A0AA',
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
                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Mail className={`absolute left-3 w-5 h-5 transition-all duration-300 ${focusedInput === "email" ? 'text-[#6C63FF]' : 'text-[#A0A0AA]'}`} />
                    
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...register('email')}
                      onFocus={(e) => { setFocusedInput("email"); e.target.select(); }}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-[rgba(255,255,255,0.05)] border-transparent focus:border-[#6C63FF] text-[#F5F5F7] placeholder:text-[#A0A0AA] h-12 transition-all duration-300 focus:bg-[rgba(255,255,255,0.08)] text-sm"
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
                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Lock className={`absolute left-3 w-5 h-5 transition-all duration-300 ${focusedInput === "password" ? 'text-[#6C63FF]' : 'text-[#A0A0AA]'}`} />
                    
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...register('password')}
                      onFocus={(e) => { setFocusedInput("password"); e.target.select(); }}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-[rgba(255,255,255,0.05)] border-transparent focus:border-[#6C63FF] text-[#F5F5F7] placeholder:text-[#A0A0AA] h-12 transition-all duration-300 focus:bg-[rgba(255,255,255,0.08)] text-sm"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 cursor-pointer p-1 bg-transparent border-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} className="text-[#A0A0AA] hover:text-[#F5F5F7] transition-colors" /> : <Eye size={20} className="text-[#A0A0AA] hover:text-[#F5F5F7] transition-colors" />}
                    </button>
                  </div>
                </motion.div>
                {errors.password && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                    {errors.password.message}
                  </span>
                )}
              </div>

              <Button type="submit" isLoading={isSubmitting} leftIcon={<LogIn size={16} />} style={{ width: '100%', marginTop: '6px', background: '#F5F5F7', color: '#0b0b0f', borderRadius: '9999px', border: 'none' }}>
                Sign In
              </Button>
            </form>

            {/* Quick Fill Demo Roles */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#A0A0AA', display: 'block', marginBottom: '10px' }}>
                Quick-fill demo account:
              </span>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('admin@hrsystem.com', 'Admin')} style={{ color: '#A0A0AA', borderColor: 'rgba(255,255,255,0.08)' }}>
                  Admin
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('hr@hrsystem.com', 'HR')} style={{ color: '#A0A0AA', borderColor: 'rgba(255,255,255,0.08)' }}>
                  HR
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('employee@hrsystem.com', 'Employee')} style={{ color: '#A0A0AA', borderColor: 'rgba(255,255,255,0.08)' }}>
                  Employee
                </Button>
              </div>
            </div>
          </motion.div>
            </div>

            {/* ── DIVIDER ─────────────────────────────────────────────────── */}
            <div className={styles.divider}></div>

            {/* ── RIGHT SIDE: Info panel ──────────────────────────────────── */}
            <div className={styles.infoSection}>
              <motion.div
                className={styles.infoWrap}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
            <Logo size="md" showText={false} />
            <h2 className={styles.glassHeadline}>
              Everything your team needs, in one trail.
            </h2>
            <p className={styles.glassSubtext}>
              WorkTrail unifies project tracking, team management, and compliance into a single platform.
            </p>

            <div className={styles.featureList}>
              {features.map((feat) => (
                <div key={feat.label} className={styles.featureRow}>
                  <div className={styles.featureIcon}>
                    {feat.icon}
                  </div>
                  <div className={styles.featureText}>
                    <span className={styles.featureLabel}>{feat.label}</span>
                    <span className={styles.featureDesc}>{feat.desc}</span>
                  </div>
                </div>
              ))}
              </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
