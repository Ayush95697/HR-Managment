import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';

interface RoleGateProps {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
