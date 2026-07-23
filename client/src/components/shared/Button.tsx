import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--surface-2, #1e293b)',
          color: 'var(--text-primary, #f8fafc)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger, #ef4444)',
          color: '#ffffff',
          border: 'none',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary, #94a3b8)',
          border: 'none',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--accent, #6366f1)',
          color: '#ffffff',
          border: 'none',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.8125rem' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '1rem' };
      case 'md':
      default:
        return { padding: '9px 18px', fontSize: '0.875rem' };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: 'var(--radius-md, 8px)',
        fontWeight: 600,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.65 : 1,
        transition: 'all 0.15s ease',
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === 'sm' ? 14 : 18} color={variant === 'secondary' || variant === 'ghost' ? 'var(--text-primary)' : '#ffffff'} />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
