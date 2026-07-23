import client from './client';
import type { TaskCard, TaskComment, TaskActivityLogEntry } from '../types';

export interface CreateCardRequest {
  columnId: string;
  title: string;
  description?: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | number;
  dueDate?: string | null;
  assignedToId?: string | null;
}

export interface PatchCardRequest {
  columnId?: string;
  position?: number;
  title?: string | null;
  description?: string | null;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | number;
  dueDate?: string | null;
  assignedToId?: string | null;
  clearAssignee?: boolean;
  rowVersion: string;
}

export const cardsApi = {
  create: (boardId: string, data: CreateCardRequest) => {
    const priorityMap: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
    const payload = {
      ...data,
      priority: typeof data.priority === 'string' ? priorityMap[data.priority] : data.priority
    };
    return client.post<TaskCard>(`/boards/${boardId}/cards`, payload).then((r) => r.data);
  },

  getById: (id: string) =>
    client.get<TaskCard>(`/cards/${id}`).then((r) => r.data),

  patch: (id: string, data: PatchCardRequest) => {
    const priorityMap: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
    const payload = {
      ...data,
      ...(data.priority && typeof data.priority === 'string' ? { priority: priorityMap[data.priority] } : {})
    };
    return client.patch<TaskCard>(`/cards/${id}`, payload).then((r) => r.data);
  },

  delete: (id: string) =>
    client.delete(`/cards/${id}`),


  addComment: (cardId: string, data: { body: string }) =>
    client.post<TaskComment>(`/cards/${cardId}/comments`, data).then((r) => r.data),

  getActivity: (cardId: string) =>
    client.get<TaskActivityLogEntry[]>(`/cards/${cardId}/activity`).then((r) => r.data),
};
