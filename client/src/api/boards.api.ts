import client from './client';
import type { Board, BoardColumn } from '../types';
import type { BoardFormData } from '../types/schemas';

export const boardsApi = {
  getAll: () => client.get<Board[]>('/boards').then((r) => r.data),

  getById: (id: string) =>
    client.get<Board & { columns: BoardColumn[] }>(`/boards/${id}`).then((r) => r.data),

  create: (data: BoardFormData) => client.post<Board>('/boards', data).then((r) => r.data),

  update: (id: string, data: { name: string }) =>
    client.put<Board>(`/boards/${id}`, data).then((r) => r.data),

  delete: (id: string) => client.delete(`/boards/${id}`),
};
