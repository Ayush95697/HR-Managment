import client from './client';
import type { Department } from '../types';
import type { DepartmentFormData } from '../types/schemas';

export const departmentsApi = {
  getAll: () => client.get<Department[]>('/departments').then((r) => r.data),

  getById: (id: string) => client.get<Department>(`/departments/${id}`).then((r) => r.data),

  create: (data: DepartmentFormData) =>
    client.post<Department>('/departments', data).then((r) => r.data),

  delete: (id: string) => client.delete(`/departments/${id}`).then((r) => r.data),
};
