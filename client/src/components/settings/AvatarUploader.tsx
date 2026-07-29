import { useState, useRef } from 'react';
import { Upload, Trash2, User } from 'lucide-react';
import type { UserProfile } from '../../api/profile.api';
import { useUploadAvatar, useRemoveAvatar } from '../../hooks/useProfile';
import Button from '../shared/Button';

interface Props {
  profile: UserProfile;
}

export default function AvatarUploader({ profile }: Props) {
  const [preview, setPreview] = useState<string | null>(profile.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleFileSelect = async (file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.');
      return;
    }
    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      await uploadAvatar.mutateAsync(file);
    } catch {
      setPreview(profile.avatarUrl);
      setError('Upload failed. Please try again.');
    }
  };

  const handleRemove = async () => {
    try {
      await removeAvatar.mutateAsync();
      setPreview(null);
    } catch {
      setError('Failed to remove avatar.');
    }
  };

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
        Profile Picture
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* Avatar circle */}
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid var(--border)',
          flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), #2563EB)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#fff',
        }}>
          {preview
            ? <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials || <User size={36} />
          }
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={uploadAvatar.isPending}
            leftIcon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              isLoading={removeAvatar.isPending}
              leftIcon={<Trash2 size={14} />}
              onClick={handleRemove}
              style={{ color: 'var(--danger)' }}
            >
              Remove
            </Button>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            JPG, PNG or WebP · Max 2MB
          </span>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
