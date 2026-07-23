import client from './client';
import type { BoardColumn } from '../types';
import type { ColumnFormData } from '../types/schemas';

export const columnsApi = {
  create: (boardId: string, data: ColumnFormData) =>
    client.post<BoardColumn>(`/boards/${boardId}/columns`, data).then((r) => r.data),

  update: (id: string, data: { name: string; order?: number }) =>
    client.put<BoardColumn>(`/columns/${id}`, data).then((r) => r.data),

  delete: (id: string) => client.delete(`/columns/${id}`),
};
