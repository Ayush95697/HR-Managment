import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChangePassword } from '../../hooks/useProfile';
import Button from '../shared/Button';

const schema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<{ field?: string; message: string } | null>(null);
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const changePassword = useChangePassword();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      // Force logout — all refresh tokens are now revoked server-side
      logout();
      navigate('/login', { state: { message: 'Password changed successfully. Please log in again.' } });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'An error occurred.';
      const field = err?.response?.data?.field;
      if (field === 'currentPassword') {
        setError('currentPassword', { message: msg });
      } else {
        setApiError({ message: msg });
      }
    }
  };

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      tabIndex={-1}
      onClick={toggle}
      style={{
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
        padding: 0, display: 'flex', alignItems: 'center',
      }}
    >
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Change Password
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        After changing your password, you'll be signed out of all devices.
      </p>

      {apiError && (
        <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem' }}>
          {apiError.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        {/* Current password */}
        <div>
          <label className="form-label">Current Password</label>
          <div style={{ position: 'relative' }}>
            <input
              {...register('currentPassword')}
              type={showCurrent ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              style={{ paddingRight: '40px' }}
            />
            {eyeBtn(showCurrent, () => setShowCurrent(v => !v))}
          </div>
          {errors.currentPassword && <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{errors.currentPassword.message}</span>}
        </div>

        {/* New password */}
        <div>
          <label className="form-label">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              {...register('newPassword')}
              type={showNew ? 'text' : 'password'}
              className="form-input"
              placeholder="Min. 8 characters"
              style={{ paddingRight: '40px' }}
            />
            {eyeBtn(showNew, () => setShowNew(v => !v))}
          </div>
          {errors.newPassword && <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{errors.newPassword.message}</span>}
        </div>

        {/* Confirm password */}
        <div>
          <label className="form-label">Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              className="form-input"
              placeholder="Repeat new password"
              style={{ paddingRight: '40px' }}
            />
            {eyeBtn(showConfirm, () => setShowConfirm(v => !v))}
          </div>
          {errors.confirmPassword && <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{errors.confirmPassword.message}</span>}
        </div>

        <Button
          type="submit"
          variant="danger"
          isLoading={isSubmitting}
          leftIcon={<Lock size={15} />}
        >
          Update Password
        </Button>
      </form>
    </div>
  );
}
