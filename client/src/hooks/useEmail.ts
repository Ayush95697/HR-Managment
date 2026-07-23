import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi, type SendEmailPayload } from '../api/email.api';
import type { TemplateFormData } from '../types/schemas';

export const EMAIL_TEMPLATES_QUERY_KEY = ['email', 'templates'];
export const EMAIL_LOGS_QUERY_KEY = ['email', 'logs'];

export function useEmailTemplates() {
  return useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEY,
    queryFn: emailApi.getTemplates,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplateFormData) => emailApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEY });
    },
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendEmailPayload) => emailApi.sendEmail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_LOGS_QUERY_KEY });
    },
  });
}

export function useEmailLogs() {
  return useQuery({
    queryKey: EMAIL_LOGS_QUERY_KEY,
    queryFn: emailApi.getLogs,
    refetchInterval: 10000, // auto poll logs
  });
}
