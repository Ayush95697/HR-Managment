export type Role = 'Admin' | 'HR' | 'Employee';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type EmailStatus = 'Queued' | 'Sent' | 'Failed';
export type ActivityAction = 'Created' | 'Moved' | 'Assigned' | 'Commented' | 'Edited' | 'Deleted';

export const PriorityNumeric: Record<Priority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};

export const ActivityActionMap: Record<number, ActivityAction> = {
  0: 'Created',
  1: 'Moved',
  2: 'Assigned',
  3: 'Commented',
  4: 'Edited',
  5: 'Deleted',
};

export const PriorityMap: Record<number, Priority> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
  3: 'Critical',
};

export const PriorityColor: Record<Priority, string> = {
  Low: 'var(--success, #10b981)',
  Medium: 'var(--accent, #6366f1)',
  High: 'var(--warning, #f59e0b)',
  Critical: 'var(--danger, #ef4444)',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
  departmentName?: string | null;
  managerId: string | null;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  activeUserCount?: number;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  ownerName?: string;
  departmentId: string;
  departmentName?: string;
  columnCount?: number;
  cardCount?: number;
  createdAt: string;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  order: number;
  cards: TaskCard[];
}

export interface TaskCard {
  id: string;
  boardId: string;
  columnId: string;
  columnName?: string;
  assignedToId: string | null;
  assignedToName?: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  createdById: string;
  createdByName?: string;
  position: number;
  rowVersion: string;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskCardId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface TaskActivityLogEntry {
  id: string;
  taskCardId: string;
  actorId: string;
  actorName: string;
  fromColumnId: string | null;
  fromColumnName?: string | null;
  toColumnId: string | null;
  toColumnName?: string | null;
  action: ActivityAction;
  timestamp: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  placeholderSchema: Record<string, string>;
  isQuickAccess: boolean;
}

export interface EmailLog {
  id: string;
  toUserId: string;
  toUserName?: string;
  toUserEmail?: string;
  templateId: string;
  templateName?: string;
  sentById: string;
  sentByName?: string;
  status: EmailStatus;
  idempotencyKey: string;
  queuedAt: string;
  sentAt: string | null;
  errorMessage?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface JWTPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
  exp: number;
}
