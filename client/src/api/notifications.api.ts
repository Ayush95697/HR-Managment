import api from './axios';

export interface Notification {
  id: string;
  type: number; // NotificationType enum (0: TaskAssigned, 1: TaskMoved, 2: TaskCommented, 3: EmailFailed)
  message: string;
  taskCardId: string | null;
  boardId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const notificationsApi = {
  getList: async (page = 1, pageSize = 20) => {
    const res = await api.get<PaginatedNotifications>(`/notifications?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get<{ count: number }>('/notifications/unread-count');
    return res.data;
  },
  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await api.post('/notifications/mark-all-read');
  }
};
