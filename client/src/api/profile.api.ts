import client from './client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  departmentId: string | null;
  departmentName: string | null;
  managerId: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  themePreference: string;
  emailNotificationsEnabled: boolean;
}

export interface UpdateProfilePayload {
  name: string;
  themePreference: string;
  emailNotificationsEnabled: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface SessionDto {
  id: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export const profileApi = {
  getMe: () => client.get<UserProfile>('/users/me').then((r: { data: UserProfile }) => r.data),

  updateMe: (payload: UpdateProfilePayload) =>
    client.put<UserProfile>('/users/me', payload).then((r: { data: UserProfile }) => r.data),

  uploadAvatar: (file: File) =>
    client
      .postForm<{ avatarUrl: string }>('/users/me/avatar', { file })
      .then((r: { data: { avatarUrl: string } }) => r.data),

  removeAvatar: () => client.delete('/users/me/avatar'),

  changePassword: (payload: ChangePasswordPayload) =>
    client.post<{ message: string }>('/users/me/change-password', payload).then((r: { data: { message: string } }) => r.data),

  getSessions: () => client.get<SessionDto[]>('/users/me/sessions').then((r: { data: SessionDto[] }) => r.data),

  revokeSession: (id: string) => client.delete(`/users/me/sessions/${id}`),

  revokeAllOtherSessions: () => client.delete('/users/me/sessions'),
};
