import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../types/schemas';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';
import Button from '../components/shared/Button';
import ErrorBanner from '../components/shared/ErrorBanner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('Employee');

  // Always redirect to dashboard on login to prevent 403 errors from old state
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
    setValue('password', 'Admin123!', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background, #0f172a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--surface, #1e293b)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
          borderRadius: 'var(--radius-xl, 12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '36px 32px',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent, #6366f1), #8b5cf6)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            HR
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Sign in to HR Management System
          </p>
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

        {/* Role Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '12px' }}>
            Login As
          </label>
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--background)', padding: '6px', borderRadius: 'var(--radius-lg, 12px)' }}>
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
                  backgroundColor: selectedRole === role ? 'var(--surface-2, #334155)' : 'transparent',
                  color: selectedRole === role ? 'var(--text-primary)' : 'var(--text-muted)',
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
          <div>
            <label className="form-label">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="form-input"
              placeholder="admin@hrsystem.com"
              autoComplete="email"
            />
            {errors.email && (
              <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              {...register('password')}
              type="password"
              className="form-input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          <Button type="submit" isLoading={isSubmitting} leftIcon={<LogIn size={16} />} style={{ width: '100%', marginTop: '6px' }}>
            Sign In
          </Button>
        </form>

        {/* Quick Fill Demo Roles */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            Quick-fill demo account:
          </span>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('admin@hrsystem.com', 'Admin')}>
              Admin
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('hr@hrsystem.com', 'HR')}>
              HR
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => quickFill('employee@hrsystem.com', 'Employee')}>
              Employee
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
