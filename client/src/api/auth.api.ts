import client from './client';
import type { AuthResponse, User } from '../types';
import type { LoginFormData } from '../types/schemas';

export const authApi = {
  login: (data: LoginFormData) =>
    client.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: () =>
    client.post<{ accessToken: string }>('/auth/refresh').then((r) => r.data),

  logout: () =>
    client.post('/auth/logout').then((r) => r.data),

  getMe: () =>
    client.get<User>('/users/me').then((r) => r.data),
};
