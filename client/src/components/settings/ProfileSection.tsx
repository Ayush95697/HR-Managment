import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import type { UserProfile } from '../../api/profile.api';
import { useUpdateProfile } from '../../hooks/useProfile';
import Button from '../shared/Button';
import RoleBadge from '../shared/RoleBadge';
import type { Role } from '../../types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type FormData = z.infer<typeof schema>;

interface Props {
  profile: UserProfile;
}

export default function ProfileSection({ profile }: Props) {
  const [saved, setSaved] = useState(false);
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name },
  });

  const onSubmit = async (data: FormData) => {
    await updateProfile.mutateAsync({
      name: data.name,
      themePreference: profile.themePreference,
      emailNotificationsEnabled: profile.emailNotificationsEnabled,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
        Profile Information
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Name */}
        <div>
          <label className="form-label">Display Name</label>
          <input {...register('name')} className="form-input" placeholder="Your name" />
          {errors.name && <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{errors.name.message}</span>}
        </div>

        {/* Read-only fields */}
        <div>
          <label className="form-label">Email Address</label>
          <input value={profile.email} readOnly className="form-input" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Email cannot be changed here. Contact an admin.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Role</label>
            <div style={{ marginTop: '6px' }}>
              <RoleBadge role={profile.roleName as Role} />
            </div>
          </div>
          {profile.departmentName && (
            <div style={{ flex: 1 }}>
              <label className="form-label">Department</label>
              <div style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}>
                {profile.departmentName}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            type="submit"
            isLoading={updateProfile.isPending}
            disabled={!isDirty}
            leftIcon={<Save size={15} />}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
          {saved && <span style={{ fontSize: '0.85rem', color: 'var(--success, #22c55e)' }}>✓ Profile updated</span>}
        </div>
      </form>
    </div>
  );
}
