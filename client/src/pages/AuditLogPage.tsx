import { useState } from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuditLogs, AUDIT_LOGS_QUERY_KEY } from '../hooks/useAudit';
import { auditApi } from '../api/audit.api';
import Spinner from '../components/shared/Spinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import Modal from '../components/shared/Modal';
import { ActivityActionMap } from '../types';

export default function AuditLogPage() {
  const queryClient = useQueryClient();
  const { data: logs = [], isLoading, error } = useAuditLogs();
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const clearLogsMutation = useMutation({
    mutationFn: auditApi.clearLogs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_QUERY_KEY });
      setIsConfirmModalOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner title="Audit Error" message="Could not fetch system audit logs." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Audit Logs
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            System-wide security and action event activity timeline
          </p>
        </div>
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--danger)',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <Trash2 size={16} />
          Clear Logs
        </button>
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Clear Logs"
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          <p>Are you sure you want to permanently delete all audit logs? This action cannot be undone.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => clearLogsMutation.mutate()}
              disabled={clearLogsMutation.isPending}
              style={{
                backgroundColor: 'var(--danger)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: clearLogsMutation.isPending ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                opacity: clearLogsMutation.isPending ? 0.7 : 1,
              }}
            >
              {clearLogsMutation.isPending ? 'Clearing...' : 'Yes, Clear All Logs'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Logs Table */}
      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Actor</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Entity</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Details</th>
              <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ShieldAlert size={32} style={{ marginBottom: '8px' }} />
                  <div>No audit events recorded yet.</div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.actorName || log.actorId}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                    {log.actorRole || '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {typeof log.action === 'number' ? ActivityActionMap[log.action as number] || 'Unknown' : log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                    Task Card {log.taskCardId ? `(${log.taskCardId.slice(0, 8)}...)` : ''}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </button>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', border: '1px solid var(--border)', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>Audit Log Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', fontSize: '0.875rem', marginTop: '16px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Log ID:</div>
              <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedLog.id}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Task Card ID:</div>
              <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedLog.taskCardId}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Actor Name:</div>
              <div style={{ color: 'var(--text-primary)' }}>{selectedLog.actorName || '—'}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Actor ID:</div>
              <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedLog.actorId}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Role:</div>
              <div style={{ color: 'var(--text-primary)' }}>{selectedLog.actorRole || '—'}</div>
              
              {selectedLog.fromColumnId && (
                <>
                  <div style={{ color: 'var(--text-muted)' }}>From Column:</div>
                  <div style={{ color: 'var(--text-primary)' }}>{selectedLog.fromColumnName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({selectedLog.fromColumnId})</span></div>
                </>
              )}
              
              {selectedLog.toColumnId && (
                <>
                  <div style={{ color: 'var(--text-muted)' }}>To Column:</div>
                  <div style={{ color: 'var(--text-primary)' }}>{selectedLog.toColumnName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({selectedLog.toColumnId})</span></div>
                </>
              )}
              
              <div style={{ color: 'var(--text-muted)' }}>Action:</div>
              <div style={{ color: 'var(--text-primary)' }}>{typeof selectedLog.action === 'number' ? ActivityActionMap[selectedLog.action as number] || 'Unknown' : selectedLog.action}</div>
              
              <div style={{ color: 'var(--text-muted)' }}>Timestamp:</div>
              <div style={{ color: 'var(--text-primary)' }}>{selectedLog.timestamp}</div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Metadata (JSON):</strong>
              <pre style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', padding: '12px', borderRadius: '4px', overflowX: 'auto', fontSize: '0.8rem', marginTop: '8px', border: '1px solid var(--border)' }}>
                {selectedLog.metadataJson ? (() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedLog.metadataJson), null, 2);
                  } catch {
                    return selectedLog.metadataJson;
                  }
                })() : 'No additional metadata attached to this event.'}
              </pre>
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setSelectedLog(null)} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
