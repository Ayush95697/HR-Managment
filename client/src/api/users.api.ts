import client from './client';
import type { UserFormData } from '../types/schemas';

export const usersApi = {
  getAll: () => client.get<any[]>('/users').then((r) => r.data.map(u => ({ ...u, role: u.roleName }))),

  getById: (id: string) => client.get<any>(`/users/${id}`).then((r) => ({ ...r.data, role: r.data.roleName })),

  create: (data: UserFormData) => {
    const roleMap: Record<string, number> = { Admin: 1, HR: 2, Employee: 3 };
    const payload = {
      ...data,
      roleId: roleMap[data.role],
      departmentId: data.departmentId || null,
      managerId: data.managerId || null,
    };
    return client.post<any>('/users', payload).then((r) => ({ ...r.data, role: r.data.roleName }));
  },

  update: (id: string, data: Partial<UserFormData> & { isActive?: boolean }) => {
    const roleMap: Record<string, number> = { Admin: 1, HR: 2, Employee: 3 };
    const payload = {
      ...data,
      ...(data.role ? { roleId: roleMap[data.role] } : {}),
      ...(data.departmentId !== undefined ? { departmentId: data.departmentId || null } : {}),
      ...(data.managerId !== undefined ? { managerId: data.managerId || null } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {})
    };
    return client.put<any>(`/users/${id}`, payload).then((r) => ({ ...r.data, role: r.data.roleName }));
  },

  delete: (id: string) => client.delete(`/users/${id}`),
};
