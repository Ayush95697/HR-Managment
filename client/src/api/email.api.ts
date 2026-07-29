import client from './client';
import type { EmailTemplate, EmailLog } from '../types';
import type { TemplateFormData } from '../types/schemas';

export interface SendEmailPayload {
  templateId: string;
  toUserId: string;
  placeholders: Record<string, string>;
  idempotencyKey: string;
}

export const emailApi = {
  getTemplates: () =>
    client.get<EmailTemplate[]>('/email/templates').then((r) => r.data),

  createTemplate: (data: TemplateFormData) =>
    client.post<EmailTemplate>('/email/templates', data).then((r) => r.data),

  deleteTemplate: (id: string) =>
    client.delete(`/email/templates/${id}`),

  toggleQuickAccess: (id: string, isQuickAccess: boolean) =>
    client.put(`/email/templates/${id}/toggle-quick-access?isQuickAccess=${isQuickAccess}`),

  sendEmail: (data: SendEmailPayload) =>
    client.post<EmailLog>('/email/send', data).then((r) => r.data),

  getLogs: () =>
    client.get<EmailLog[]>('/email/logs').then((r) => r.data),
};
