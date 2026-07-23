import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Plus, Send, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useEmailTemplates, useCreateEmailTemplate, useSendEmail, useEmailLogs } from '../hooks/useEmail';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import { templateSchema, sendEmailSchema, type TemplateFormData, type SendEmailFormData } from '../types/schemas';
import type { EmailTemplate } from '../types';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Modal from '../components/shared/Modal';

export default function EmailCenterPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'Admin';
  const userDeptId = currentUser?.departmentId;

  // TanStack Query Hooks
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates();
  const { data: logs = [], isLoading: logsLoading } = useEmailLogs();
  const { data: allUsers = [] } = useUsers();

  const createTemplateMutation = useCreateEmailTemplate();
  const sendEmailMutation = useSendEmail();

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<EmailTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  // Filter Recipient List per Section 5 Role Matrix:
  // HR -> limited to own department users
  // Admin -> unrestricted (all users)
  const recipientUsers = useMemo(() => {
    if (isAdmin) return allUsers;
    if (!userDeptId) return allUsers;
    return allUsers.filter((u) => u.departmentId === userDeptId);
  }, [allUsers, isAdmin, userDeptId]);

  // Template Creation Form (RHF + Zod)
  const {
    register: registerTemplate,
    handleSubmit: handleSubmitTemplate,
    reset: resetTemplate,
    watch: watchTemplate,
    formState: { errors: templateErrors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  // Send Email Form (RHF + Zod)
  const {
    register: registerSend,
    handleSubmit: handleSubmitSend,
    reset: resetSend,
    formState: { errors: sendErrors },
  } = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema),
  });

  const bodyHtmlWatch = watchTemplate('bodyHtml', '');

  // Parse {{PlaceholderName}} tokens out of bodyHtml (Section 8 spec requirement)
  const extractedPlaceholders = useMemo(() => {
    if (!bodyHtmlWatch) return [];
    const matches = Array.from(bodyHtmlWatch.matchAll(/\{\{(\w+)\}\}/g), (m) => m[1]);
    return Array.from(new Set(matches));
  }, [bodyHtmlWatch]);

  const handleCreateTemplate = async (data: TemplateFormData) => {
    const schemaObj: Record<string, string> = {};
    extractedPlaceholders.forEach((p) => {
      schemaObj[p] = `String placeholder for ${p}`;
    });

    try {
      await createTemplateMutation.mutateAsync({
        ...data,
        placeholderSchema: schemaObj,
      });
      setShowTemplateModal(false);
      resetTemplate();
    } catch {
      // Error handled by hook
    }
  };

  const handleSendEmail = async (data: SendEmailFormData) => {
    if (!selectedTemplateForSend) return;

    // Section 6: Generate UUID client-side per send attempt for Idempotency
    const idempotencyKey = crypto.randomUUID();

    try {
      await sendEmailMutation.mutateAsync({
        templateId: selectedTemplateForSend.id,
        toUserId: data.toUserId,
        placeholders: placeholderValues,
        idempotencyKey,
      });
      setSelectedTemplateForSend(null);
      setPlaceholderValues({});
      resetSend();
    } catch {
      // Error handled by hook
    }
  };

  // Section 8: Live Rendered Preview Pane
  const livePreviewHtml = useMemo(() => {
    if (!selectedTemplateForSend) return '';
    let html = selectedTemplateForSend.bodyHtml;
    Object.entries(placeholderValues).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, val || `[${key}]`);
    });
    return html;
  }, [selectedTemplateForSend, placeholderValues]);

  if (templatesLoading || logsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Email Center
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Manage notification templates and dispatch emails with background worker delivery
          </p>
        </div>

        <Button leftIcon={<Plus size={16} />} onClick={() => setShowTemplateModal(true)}>
          New Template
        </Button>
      </div>

      {/* Templates Section */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Notification Templates ({templates.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Mail size={18} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {tpl.name}
                  </h3>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '12px' }}>
                  Subject: {tpl.subject}
                </div>
              </div>

              <Button
                size="sm"
                leftIcon={<Send size={14} />}
                onClick={() => {
                  setSelectedTemplateForSend(tpl);
                  setPlaceholderValues({});
                }}
              >
                Send Email
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Email Dispatch Logs */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Recent Delivery Logs ({logs.length})
        </h2>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Template</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Sender</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.toUserName || log.toUserId}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                    {log.templateName || 'Template'}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                    {log.sentByName || 'System'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {log.status === 'Sent' ? (
                      <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Sent
                      </span>
                    ) : log.status === 'Queued' ? (
                      <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> Queued
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> Failed
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(log.queuedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Create Email Template"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitTemplate(handleCreateTemplate)} isLoading={createTemplateMutation.isPending}>Save Template</Button>
          </>
        }
      >
        <form onSubmit={handleSubmitTemplate(handleCreateTemplate)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Template Name</label>
            <input {...registerTemplate('name')} className="form-input" placeholder="e.g. Employee Welcome Onboarding" autoFocus />
            {templateErrors.name && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{templateErrors.name.message}</span>}
          </div>

          <div>
            <label className="form-label">Email Subject</label>
            <input {...registerTemplate('subject')} className="form-input" placeholder="Welcome to the team, {{FirstName}}!" />
            {templateErrors.subject && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{templateErrors.subject.message}</span>}
          </div>

          <div>
            <label className="form-label">HTML Body Template</label>
            <textarea
              {...registerTemplate('bodyHtml')}
              className="form-textarea"
              rows={6}
              placeholder="<h1>Welcome {{FirstName}}</h1><p>Your manager is {{ManagerName}}.</p>"
            />
            {templateErrors.bodyHtml && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{templateErrors.bodyHtml.message}</span>}
          </div>

          {/* Dynamic extracted placeholders display */}
          {extractedPlaceholders.length > 0 && (
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '8px', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Detected Placeholders: </span>
              {extractedPlaceholders.map((p) => (
                <span key={p} style={{ backgroundColor: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: '4px', margin: '0 4px', fontSize: '0.75rem' }}>
                  {`{{${p}}}`}
                </span>
              ))}
            </div>
          )}
        </form>
      </Modal>

      {/* Send Email Modal with Live Preview Pane */}
      <Modal
        isOpen={!!selectedTemplateForSend}
        onClose={() => setSelectedTemplateForSend(null)}
        title={`Send Email — ${selectedTemplateForSend?.name}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedTemplateForSend(null)}>Cancel</Button>
            <Button onClick={handleSubmitSend(handleSendEmail)} isLoading={sendEmailMutation.isPending} leftIcon={<Send size={14} />}>
              Dispatch Email
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left: Input Form */}
          <form onSubmit={handleSubmitSend(handleSendEmail)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Recipient User</label>
              <select {...registerSend('toUserId')} className="form-select">
                <option value="">Select Recipient ({recipientUsers.length} available)</option>
                {recipientUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              {sendErrors.toUserId && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{sendErrors.toUserId.message}</span>}
            </div>

            {/* Dynamic Placeholder Input Fields */}
            {selectedTemplateForSend && Object.keys(selectedTemplateForSend.placeholderSchema || {}).length > 0 && (
              <div>
                <label className="form-label">Template Placeholders</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.keys(selectedTemplateForSend.placeholderSchema).map((key) => (
                    <div key={key}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{key}</span>
                      <input
                        className="form-input"
                        placeholder={`Value for {{${key}}}`}
                        value={placeholderValues[key] || ''}
                        onChange={(e) => setPlaceholderValues((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Right: Live Rendered Preview Pane */}
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Live Email Preview
            </h4>
            <div
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                minHeight: '220px',
                border: '1px solid var(--border)',
              }}
              dangerouslySetInnerHTML={{ __html: livePreviewHtml || '<p>No preview available</p>' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
