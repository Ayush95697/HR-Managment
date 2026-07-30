import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Plus, Send, Clock, CheckCircle, AlertTriangle, LayoutTemplate, Search, Minus, Trash2 } from 'lucide-react';
import { useEmailTemplates, useCreateEmailTemplate, useSendEmail, useEmailLogs, useDeleteEmailTemplate, useToggleQuickAccess } from '../hooks/useEmail';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import { templateSchema, sendEmailSchema, type TemplateFormData, type SendEmailFormData } from '../types/schemas';
import type { EmailTemplate } from '../types';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Modal from '../components/shared/Modal';

const PREDEFINED_TEMPLATES = [
  {
    category: 'Recruitment',
    categoryColor: '#3b82f6',
    name: 'Interview Invitation',
    description: 'Invite shortlisted candidates for an interview.',
    subject: 'Invitation to Interview with [Company Name]',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{CandidateName}},</p>\n  <p>Thank you for applying for the <strong>{{JobTitle}}</strong> position. We would like to invite you for an interview.</p>\n  <p>Date: <strong>{{InterviewDate}}</strong></p>\n  <p>Location: <strong>{{Location}}</strong></p>\n  <br/>\n  <p>Best regards,<br/>The Recruitment Team</p>\n</div>`,
    variables: ['CandidateName', 'JobTitle', 'InterviewDate', 'Location']
  },
  {
    category: 'Recruitment',
    categoryColor: '#3b82f6',
    name: 'Job Offer',
    description: 'Send offer letters to selected candidates.',
    subject: 'Offer of Employment from [Company Name]',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{CandidateName}},</p>\n  <p>We are delighted to offer you the position of <strong>{{JobTitle}}</strong>.</p>\n  <p>Please find the offer details and contract attached. Let us know if you have any questions.</p>\n  <br/>\n  <p>Welcome to the team!<br/>HR Department</p>\n</div>`,
    variables: ['CandidateName', 'JobTitle']
  },
  {
    category: 'Recruitment',
    categoryColor: '#3b82f6',
    name: 'Rejection Email',
    description: 'Update candidates on their application status.',
    subject: 'Update on your application for [Job Title]',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{CandidateName}},</p>\n  <p>Thank you for taking the time to interview for the <strong>{{JobTitle}}</strong> position. After careful consideration, we have decided to move forward with another candidate.</p>\n  <p>We were impressed by your background and would love to keep in touch for future opportunities.</p>\n  <br/>\n  <p>Best regards,<br/>The Recruitment Team</p>\n</div>`,
    variables: ['CandidateName', 'JobTitle']
  },
  {
    category: 'Onboarding',
    categoryColor: '#10b981',
    name: 'IT Equipment Setup',
    description: 'Provide instructions for IT setup and access.',
    subject: 'Action Required: Your IT Equipment & Account Setup',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Hi {{EmployeeName}},</p>\n  <p>Your IT equipment is ready for pickup or delivery.</p>\n  <p>Please follow the instructions in the attached guide to set up your accounts and access the company network.</p>\n  <br/>\n  <p>Thanks,<br/>IT Department</p>\n</div>`,
    variables: ['EmployeeName']
  },
  {
    category: 'Onboarding',
    categoryColor: '#10b981',
    name: 'First Day Schedule',
    description: 'Welcome new hires and share their first-day schedule.',
    subject: 'Your First Day Schedule at [Company Name]!',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <h2>Welcome aboard, {{EmployeeName}}!</h2>\n  <p>We are thrilled to have you join our team. Your account has been successfully created.</p>\n  <p>Your designated department is: <strong>{{DepartmentName}}</strong></p>\n  <p>Please log in to the HR Portal to complete your onboarding tasks and review your first-day schedule.</p>\n  <br/>\n  <p>Best regards,<br/>The HR Team</p>\n</div>`,
    variables: ['EmployeeName', 'DepartmentName']
  },
  {
    category: 'Onboarding',
    categoryColor: '#10b981',
    name: 'Buddy/Mentor Intro',
    description: 'Introduce new hires to their onboarding buddy.',
    subject: 'Meet your Onboarding Buddy, {{BuddyName}}!',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Hi {{EmployeeName}},</p>\n  <p>As part of your onboarding, we have assigned you an onboarding buddy: <strong>{{BuddyName}}</strong>!</p>\n  <p>They will be reaching out to you shortly to schedule a quick chat. Feel free to ask them any questions you have about the company culture or day-to-day operations.</p>\n  <br/>\n  <p>Best regards,<br/>HR Department</p>\n</div>`,
    variables: ['EmployeeName', 'BuddyName']
  },
  {
    category: 'Payroll',
    categoryColor: '#a855f7',
    name: 'Payslip Available',
    description: 'Notify employees when payslips are ready.',
    subject: 'Your Monthly Payslip is now available',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{EmployeeName}},</p>\n  <p>Your payslip for the month of <strong>{{Month}}</strong> is now available for viewing and download in the HR Portal.</p>\n  <br/>\n  <p>Best regards,<br/>Payroll Department</p>\n</div>`,
    variables: ['EmployeeName', 'Month']
  },
  {
    category: 'Payroll',
    categoryColor: '#a855f7',
    name: 'Open Enrollment',
    description: 'Announce the start of benefits open enrollment.',
    subject: 'Action Required: Benefits Open Enrollment is starting soon',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{EmployeeName}},</p>\n  <p>Our annual Benefits Open Enrollment period will run from <strong>{{StartDate}}</strong> to <strong>{{EndDate}}</strong>.</p>\n  <p>Please log into the HR portal to review your current elections and make any necessary changes for the upcoming year.</p>\n  <br/>\n  <p>Best regards,<br/>HR Department</p>\n</div>`,
    variables: ['EmployeeName', 'StartDate', 'EndDate']
  },
  {
    category: 'Payroll',
    categoryColor: '#a855f7',
    name: 'Tax Document Availability',
    description: 'Notify employees about annual tax documents.',
    subject: 'Important: Your Annual Tax Documents are ready',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{EmployeeName}},</p>\n  <p>Your annual tax documents for the year <strong>{{TaxYear}}</strong> are now available for download.</p>\n  <p>Please log into the HR portal and navigate to the Documents section to access your files.</p>\n  <br/>\n  <p>Best regards,<br/>Payroll Department</p>\n</div>`,
    variables: ['EmployeeName', 'TaxYear']
  },
  {
    category: 'Performance',
    categoryColor: '#f97316',
    name: 'Goal Setting Reminder',
    description: 'Remind employees to submit their quarterly goals.',
    subject: 'Reminder: Submit your Quarterly Goals',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Hi {{EmployeeName}},</p>\n  <p>This is a reminder to submit your goals for <strong>{{Quarter}}</strong> by <strong>{{Deadline}}</strong>.</p>\n  <p>Log in to the portal to document your objectives and key results.</p>\n  <br/>\n  <p>Best,<br/>HR Team</p>\n</div>`,
    variables: ['EmployeeName', 'Quarter', 'Deadline']
  },
  {
    category: 'Performance',
    categoryColor: '#f97316',
    name: 'Training Session Invite',
    description: 'Invite employees to required training sessions.',
    subject: 'Required Training: {{TrainingTopic}}',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{EmployeeName}},</p>\n  <p>You are required to complete the upcoming training session on <strong>{{TrainingTopic}}</strong>.</p>\n  <p>Please complete this training by <strong>{{Deadline}}</strong>. The link to the course is available in your training dashboard.</p>\n  <br/>\n  <p>Thank you,<br/>HR Department</p>\n</div>`,
    variables: ['EmployeeName', 'TrainingTopic', 'Deadline']
  },
  {
    category: 'Performance',
    categoryColor: '#f97316',
    name: 'Probation Review',
    description: 'Schedule a 90-day probation review meeting.',
    subject: 'Upcoming 90-Day Probation Review',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Dear {{EmployeeName}},</p>\n  <p>Your 90-day probation review has been scheduled for <strong>{{ReviewDate}}</strong>.</p>\n  <p>Please complete your self-evaluation form before the meeting.</p>\n  <br/>\n  <p>Best regards,<br/>HR Department</p>\n</div>`,
    variables: ['EmployeeName', 'ReviewDate']
  },
  {
    category: 'Culture',
    categoryColor: '#ec4899',
    name: 'Work Anniversary',
    description: 'Congratulate employees on their work anniversary.',
    subject: 'Happy {{Years}} Year Work Anniversary, {{EmployeeName}}!',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <h2>Happy Anniversary, {{EmployeeName}}! 🎉</h2>\n  <p>Congratulations on reaching your <strong>{{Years}}</strong> year work anniversary with us!</p>\n  <p>Thank you for all your hard work and dedication. We truly appreciate everything you do for the team.</p>\n  <br/>\n  <p>Best regards,<br/>Everyone at [Company Name]</p>\n</div>`,
    variables: ['EmployeeName', 'Years']
  },
  {
    category: 'Culture',
    categoryColor: '#ec4899',
    name: 'Birthday Wishes',
    description: 'Send happy birthday wishes to employees.',
    subject: 'Wishing you a very Happy Birthday! 🎂',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <h2>Happy Birthday, {{EmployeeName}}! 🎂</h2>\n  <p>Wishing you a wonderful birthday and a fantastic year ahead.</p>\n  <p>Enjoy your special day!</p>\n  <br/>\n  <p>Best regards,<br/>Your Team at [Company Name]</p>\n</div>`,
    variables: ['EmployeeName']
  },
  {
    category: 'Culture',
    categoryColor: '#ec4899',
    name: 'Town Hall Invite',
    description: 'Invite the company to a Town Hall or All-Hands.',
    subject: 'Invitation: Quarterly Company All-Hands Meeting',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Hi Team,</p>\n  <p>Please join us for our upcoming Quarterly All-Hands Meeting on <strong>{{MeetingDate}}</strong>.</p>\n  <p>We will be discussing our recent achievements and the roadmap for the upcoming quarter.</p>\n  <p>The meeting link is attached to the calendar invite.</p>\n  <br/>\n  <p>See you there,<br/>Executive Team</p>\n</div>`,
    variables: ['MeetingDate']
  },
  {
    category: 'Attendance',
    categoryColor: '#ef4444',
    name: 'Holiday Announcement',
    description: 'Announce upcoming public holidays and office closures.',
    subject: 'Upcoming Office Closure for {{HolidayName}}',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Hi everyone,</p>\n  <p>Please be advised that the office will be closed on <strong>{{Date}}</strong> in observance of <strong>{{HolidayName}}</strong>.</p>\n  <p>Regular business hours will resume on the following business day.</p>\n  <br/>\n  <p>Enjoy the holiday,<br/>HR Department</p>\n</div>`,
    variables: ['Date', 'HolidayName']
  },
  {
    category: 'Attendance',
    categoryColor: '#ef4444',
    name: 'Leave Balance Warning',
    description: 'Remind employees about expiring PTO days.',
    subject: 'Friendly Reminder: You have expiring PTO days',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Hi {{EmployeeName}},</p>\n  <p>This is a friendly reminder that you have <strong>{{ExpiringDays}}</strong> days of PTO that will expire on <strong>{{ExpirationDate}}</strong>.</p>\n  <p>Please remember to schedule your time off before the deadline.</p>\n  <br/>\n  <p>Best regards,<br/>HR Department</p>\n</div>`,
    variables: ['EmployeeName', 'ExpiringDays', 'ExpirationDate']
  },
  {
    category: 'Attendance',
    categoryColor: '#ef4444',
    name: 'Shift Schedule Change',
    description: 'Notify employees about a shift schedule update.',
    subject: 'Important: Update to your upcoming shift schedule',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5;">\n  <p>Hi {{EmployeeName}},</p>\n  <p>There has been an update to your shift schedule for the week of <strong>{{WeekDate}}</strong>.</p>\n  <p>Please log in to the portal to review your updated schedule.</p>\n  <br/>\n  <p>Thank you,<br/>Management Team</p>\n</div>`,
    variables: ['EmployeeName', 'WeekDate']
  }
];

export default function EmailCenterPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'Admin';
  const userDeptId = currentUser?.departmentId;

  // TanStack Query Hooks
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates();
  const quickAccessTemplates = templates.filter(t => t.isQuickAccess);
  const { data: logs = [], isLoading: logsLoading } = useEmailLogs();
  const { data: allUsers = [] } = useUsers();

  const createTemplateMutation = useCreateEmailTemplate();
  const deleteTemplateMutation = useDeleteEmailTemplate();
  const toggleQuickAccessMutation = useToggleQuickAccess();
  const sendEmailMutation = useSendEmail();

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Gallery State
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<'Gallery' | 'MyTemplates'>('Gallery');
  const [gallerySearch, setGallerySearch] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [galleryPreviewTemplate, setGalleryPreviewTemplate] = useState<any | null>(null);

  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<EmailTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  
  // (Removed handleClickOutside for the old dropdown as we are using a Modal now)

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
    control: controlSend,
    handleSubmit: handleSubmitSend,
    reset: resetSend,
    watch: watchSend,
    formState: { errors: sendErrors },
  } = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema),
  });

  const bodyHtmlWatch = watchTemplate('bodyHtml', '');
  const toUserIdWatch = watchSend('toUserId');

  // Auto-fill standard placeholders when recipient is selected
  useEffect(() => {
    if (toUserIdWatch && selectedTemplateForSend) {
      const selectedUser = allUsers.find(u => u.id === toUserIdWatch);
      if (selectedUser && selectedTemplateForSend.placeholderSchema) {
        setPlaceholderValues((prev) => {
          const next = { ...prev };
          const keys = Object.keys(selectedTemplateForSend.placeholderSchema);
          
          if (keys.includes('EmployeeName')) next['EmployeeName'] = selectedUser.name;
          if (keys.includes('EmployeeEmail')) next['EmployeeEmail'] = selectedUser.email;
          
          return next;
        });
      }
    }
  }, [toUserIdWatch, selectedTemplateForSend, allUsers]);

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

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            variant="secondary" 
            leftIcon={<LayoutTemplate size={16} />} 
            onClick={() => setShowTemplateGallery(true)}
          >
            Template Gallery
          </Button>
          <Button leftIcon={<Plus size={16} />} onClick={() => {
            resetTemplate({ name: '', subject: '', bodyHtml: '' });
            setShowTemplateModal(true);
          }}>
            New Template
          </Button>
        </div>
      </div>

      {/* Templates Section */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Quick Access Templates ({quickAccessTemplates.length})
        </h2>
        
        {quickAccessTemplates.length === 0 && (
          <div style={{ padding: '32px 24px', textAlign: 'center', backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>No quick access templates yet.</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>
              Click <strong>Template Gallery</strong> to add ready-made templates, or click <strong>New Template</strong> to start from scratch.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {quickAccessTemplates.map((tpl) => (
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
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Mail size={18} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, paddingRight: '24px' }}>
                    {tpl.name}
                  </h3>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleQuickAccessMutation.mutate({ id: tpl.id, isQuickAccess: false });
                  }}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s, color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                    e.currentTarget.style.color = 'var(--danger)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                  title="Remove from Quick Access"
                >
                  <Minus size={16} />
                </button>
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
                  resetSend({ templateId: tpl.id, toUserId: '', placeholders: {} });
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> Failed
                        </span>
                        {log.errorMessage && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                            {log.errorMessage}
                          </span>
                        )}
                      </div>
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
            <input {...registerTemplate('subject')} className="form-input" placeholder="Invitation to Interview with [Company Name]" />
            {templateErrors.subject && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{templateErrors.subject.message}</span>}
          </div>

          <div>
            <label className="form-label">Template Body</label>
            <textarea
              {...registerTemplate('bodyHtml')}
              className="form-textarea"
              rows={10}
              placeholder={`Dear {{CandidateName}},\n\nThank you for applying for the {{JobTitle}} position. We would like to invite you for an interview.\n\nDate: {{InterviewDate}}\n\nLocation: {{Location}}\n\nBest regards,\nThe Recruitment Team`}
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
              <Controller
                name="toUserId"
                control={controlSend}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={recipientUsers.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
                    value={recipientUsers.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })).find(c => c.value === field.value) || null}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder={`Select Recipient (${recipientUsers.length} available)`}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface)',
                        borderColor: state.isFocused ? 'var(--accent)' : 'var(--border)',
                        boxShadow: state.isFocused ? '0 0 0 1px var(--accent)' : 'none',
                        '&:hover': { borderColor: 'var(--accent)' }
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: 'var(--surface-dropdown)',
                        border: '1px solid var(--border)',
                        zIndex: 9999
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected 
                          ? 'var(--accent)' 
                          : state.isFocused 
                            ? 'var(--surface)' 
                            : 'transparent',
                        color: state.isSelected ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        '&:active': { backgroundColor: 'var(--accent)' }
                      }),
                      singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }),
                      input: (base) => ({ ...base, color: 'var(--text-primary)' }),
                      placeholder: (base) => ({ ...base, color: 'var(--text-muted)' })
                    }}
                  />
                )}
              />
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
                whiteSpace: 'pre-wrap'
              }}
              dangerouslySetInnerHTML={{ __html: livePreviewHtml || '<p>No preview available</p>' }}
            />
          </div>
        </div>
      </Modal>
      {/* Template Gallery Modal */}
      <Modal
        isOpen={showTemplateGallery}
        onClose={() => {
          setShowTemplateGallery(false);
          setGallerySearch('');
          setActiveCategoryFilter('All');
          setActiveTab('Gallery');
        }}
        title="Template Gallery"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <button onClick={() => setActiveTab('Gallery')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'Gallery' ? 'var(--accent)' : 'transparent', color: activeTab === 'Gallery' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Gallery</button>
            <button onClick={() => setActiveTab('MyTemplates')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'MyTemplates' ? 'var(--accent)' : 'transparent', color: activeTab === 'MyTemplates' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>My Templates</button>
          </div>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search templates..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['All', ...Array.from(new Set(PREDEFINED_TEMPLATES.map(t => t.category)))].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: activeCategoryFilter === cat ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: activeCategoryFilter === cat ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-2)',
                    color: activeCategoryFilter === cat ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            maxHeight: '60vh',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {activeTab === 'Gallery' ? (
              PREDEFINED_TEMPLATES
                .filter(t => activeCategoryFilter === 'All' || t.category === activeCategoryFilter)
                .filter(t => t.name.toLowerCase().includes(gallerySearch.toLowerCase()) || t.description.toLowerCase().includes(gallerySearch.toLowerCase()))
                .map(t => {
                const savedTemplate = templates.find(saved => saved.name === t.name);
                const isQuickAccess = !!savedTemplate?.isQuickAccess;
                return (
                <div key={t.name} style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'var(--surface-dropdown)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{t.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (savedTemplate) {
                          toggleQuickAccessMutation.mutate({ id: savedTemplate.id, isQuickAccess: !isQuickAccess });
                        } else {
                          createTemplateMutation.mutate({
                            name: t.name,
                            subject: t.subject,
                            bodyHtml: t.bodyHtml,
                            placeholderSchema: t.variables.reduce((acc, v) => ({ ...acc, [v]: 'string' }), {})
                          });
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isQuickAccess ? 'var(--danger)' : 'var(--text-muted)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s, color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                        e.currentTarget.style.color = isQuickAccess ? 'var(--danger)' : 'var(--text-primary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isQuickAccess ? 'var(--danger)' : 'var(--text-muted)';
                      }}
                      title={isQuickAccess ? "Remove from Quick Access" : "Add to Quick Access"}
                    >
                      {isQuickAccess ? <Minus size={18} /> : <Plus size={18} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: t.categoryColor }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.category}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>{t.description}</p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <Button variant="secondary" size="sm" onClick={() => setGalleryPreviewTemplate(t)} style={{ flex: 1 }}>
                      Preview
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => {
                      resetTemplate(t);
                      setShowTemplateGallery(false);
                      setShowTemplateModal(true);
                    }} style={{ flex: 1 }}>
                      Customize & Use
                    </Button>
                  </div>
                  </div>
                );
              })
            ) : (
              templates
                .filter(t => t.name.toLowerCase().includes(gallerySearch.toLowerCase()) || t.subject.toLowerCase().includes(gallerySearch.toLowerCase()))
                .map(t => (
                  <div key={t.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: 'var(--surface-dropdown)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{t.name}</h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQuickAccessMutation.mutate({ id: t.id, isQuickAccess: !t.isQuickAccess });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: t.isQuickAccess ? 'var(--danger)' : 'var(--text-muted)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s, color 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                            e.currentTarget.style.color = t.isQuickAccess ? 'var(--danger)' : 'var(--text-primary)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = t.isQuickAccess ? 'var(--danger)' : 'var(--text-muted)';
                          }}
                          title={t.isQuickAccess ? "Remove from Quick Access" : "Add to Quick Access"}
                        >
                          {t.isQuickAccess ? <Minus size={18} /> : <Plus size={18} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplateMutation.mutate(t.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s, color 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        title="Delete Template"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Subject: {t.subject}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
                      <Button variant="primary" size="sm" onClick={() => {
                        setSelectedTemplateForSend(t);
                        setPlaceholderValues({});
                        resetSend({ templateId: t.id, toUserId: '', placeholders: {} });
                        setShowTemplateGallery(false);
                      }} style={{ flex: 1 }}>
                        Select & Send
                      </Button>
                    </div>
                  </div>
                ))
            )}
            {activeTab === 'MyTemplates' && templates.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                You haven't created any custom templates yet.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {galleryPreviewTemplate && (
        <Modal
          isOpen={true}
          onClose={() => setGalleryPreviewTemplate(null)}
          title={`Preview: ${galleryPreviewTemplate.name}`}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Live Render */}
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Subject: {galleryPreviewTemplate.subject}
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9375rem',
                    minHeight: '300px',
                    whiteSpace: 'pre-wrap'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: galleryPreviewTemplate.variables.reduce(
                      (html: string, variable: string) => html.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), `<span style="background-color: #fef08a; padding: 0 4px; border-radius: 4px; font-weight: 600;">[${variable}]</span>`),
                      galleryPreviewTemplate.bodyHtml
                    )
                  }}
                />
              </div>
              
              {/* Sidebar Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>Variables</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>This template requires the following placeholders to be filled before sending.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {galleryPreviewTemplate.variables.map((v: string) => (
                      <span key={v} style={{ padding: '4px 8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                  <Button 
                    variant="primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      resetTemplate(galleryPreviewTemplate);
                      setGalleryPreviewTemplate(null);
                      setShowTemplateGallery(false);
                      setShowTemplateModal(true);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
