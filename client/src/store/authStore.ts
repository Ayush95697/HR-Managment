import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { Role } from '../types';

interface AuthUser {
  sub: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setToken: (token: string | null) => {
    if (!token) {
      sessionStorage.removeItem('accessToken');
      set({ accessToken: null, user: null, isAuthenticated: false });
      return;
    }

    if (!token) {
      sessionStorage.removeItem('accessToken');
      set({ accessToken: null, user: null, isAuthenticated: false });
      return;
    }

    sessionStorage.setItem('accessToken', token);
    const decoded = jwtDecode<any>(token);
    
    const role = (decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee') as Role;
    const sub = (decoded.sub || decoded.nameid || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) as string || '';
    const name = (decoded.name || decoded.unique_name || 'User') as string;
    const deptId = (decoded.departmentId || decoded.DepartmentId) as string || null;

    const user: AuthUser = {
      sub,
      name,
      email: decoded.email || '',
      role,
      departmentId: deptId,
    };

    set({ accessToken: token, user, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  initAuth: () => {
    const savedToken = sessionStorage.getItem('accessToken');
    if (savedToken) {
      try {
        const decoded = jwtDecode<any>(savedToken);
        if (decoded.exp * 1000 > Date.now()) {
          const role = (decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee') as Role;
          const sub = (decoded.sub || decoded.nameid || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) as string || '';
          const name = (decoded.name || decoded.unique_name || 'User') as string;
          const deptId = (decoded.departmentId || decoded.DepartmentId) as string || null;

          set({
            accessToken: savedToken,
            user: {
              sub,
              name,
              email: decoded.email || '',
              role,
              departmentId: deptId,
            },
            isAuthenticated: true,
          });
          return;
        }
      } catch (e) {
        console.error('jwtDecode failed in initAuth:', e);
        // Expired or invalid token
      }
    }
    sessionStorage.removeItem('accessToken');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
