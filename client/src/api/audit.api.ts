import client from './client';

export interface AuditLog {
  id: string;
  taskCardId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  fromColumnId: string | null;
  fromColumnName: string | null;
  toColumnId: string | null;
  toColumnName: string | null;
  action: number;
  timestamp: string;
  metadataJson: string | null;
}

export const auditApi = {
  getLogs: () =>
    client.get<AuditLog[]>('/audit/logs').then((r) => r.data),
};
