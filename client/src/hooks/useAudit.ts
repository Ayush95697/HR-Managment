import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/audit.api';

export const AUDIT_LOGS_QUERY_KEY = ['audit', 'logs'];

export function useAuditLogs() {
  return useQuery({
    queryKey: AUDIT_LOGS_QUERY_KEY,
    queryFn: auditApi.getLogs,
    staleTime: 1000 * 60,
  });
}
