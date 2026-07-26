import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { useAuthStore } from './store/authStore';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoardListPage from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';
import UserManagementPage from './pages/UserManagementPage';
import DepartmentListPage from './pages/DepartmentListPage';
import EmailCenterPage from './pages/EmailCenterPage';
import AuditLogPage from './pages/AuditLogPage';
import ForbiddenPage from './pages/ForbiddenPage';
import SettingsPage from './pages/SettingsPage';

const RoleBasedHome = () => {
  const { user } = useAuthStore();
  if (user?.role === 'Employee') {
    return <Navigate to="/boards" replace />;
  }
  return <DashboardPage />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <RoleBasedHome />,
      },
      {
        path: 'boards',
        element: <BoardListPage />,
      },
      {
        path: 'boards/:id',
        element: <BoardDetailPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute roles={['Admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'departments',
        element: (
          <ProtectedRoute roles={['Admin', 'HR']}>
            <DepartmentListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'email',
        element: (
          <ProtectedRoute roles={['Admin', 'HR']}>
            <EmailCenterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit',
        element: (
          <ProtectedRoute roles={['Admin', 'HR']}>
            <AuditLogPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
