import { useState, type FormEvent } from 'react';
import { Flag, Calendar, User, Pencil, Trash2, MessageSquare, Clock, Save, ChevronRight } from 'lucide-react';
import { useCard, useCardActivity, usePatchCard, useDeleteCard, useAddComment } from '../../hooks/useCards';
import { useUsers } from '../../hooks/useUsers';
import { useAuthStore } from '../../store/authStore';
import { PriorityColor, PriorityMap, ActivityActionMap } from '../../types';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import Modal from '../shared/Modal';
import ErrorBanner from '../shared/ErrorBanner';
import ConfirmDialog from '../shared/ConfirmDialog';
import Select from '../shared/Select';

interface CardModalProps {
  cardId: string | null;
  boardId: string;
  onClose: () => void;
}

export default function CardModal({ cardId, boardId, onClose }: CardModalProps) {
  const { user: currentUser } = useAuthStore();
  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'HR';
  const canDelete = currentUser?.role === 'Admin';

  // TanStack Query Hooks
  const { data: card, isLoading: cardLoading, error: cardError } = useCard(cardId);
  const { data: activity = [] } = useCardActivity(cardId);
  const { data: users = [] } = useUsers();

  const comments = card?.comments || [];
  const commentsLoading = cardLoading;

  const patchCardMutation = usePatchCard(boardId, cardId || '');
  const deleteCardMutation = useDeleteCard(boardId);
  const addCommentMutation = useAddComment(cardId || '');

  // Form / Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssignee, setEditAssignee] = useState('');

  // Comment State
  const [commentBody, setCommentBody] = useState('');

  // Conflict error banner state
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Check Employee comment restriction: "Comment box on card: visible only if card assigned to self" for Employee role
  const isEmployee = currentUser?.role === 'Employee';
  const canComment = canEdit || (isEmployee && card?.assignedToId === currentUser?.sub);

  const startEdit = () => {
    if (!card) return;
    setEditTitle(card.title);
    setEditDesc(card.description || '');
    setEditPriority(typeof card.priority === 'number' ? PriorityMap[card.priority] : card.priority);
    setEditDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
    setEditAssignee(card.assignedToId || '');
    setIsEditing(true);
    setConflictError(null);
  };

  const handleSave = async () => {
    if (!card) return;
    setConflictError(null);

    try {
      await patchCardMutation.mutateAsync({
        title: editTitle.trim() || null,
        description: editDesc.trim() || null,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        assignedToId: editAssignee || null,
        clearAssignee: !editAssignee,
        rowVersion: card.rowVersion,
      });
      setIsEditing(false);
    } catch (err: unknown) {
      const apiErr = err as { isConflict?: boolean; message?: string };
      if (apiErr?.isConflict) {
        setConflictError('This card was updated by someone else. Fresh data has been re-fetched.');
      } else {
        setConflictError(apiErr?.message || 'Failed to save changes.');
      }
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    try {
      await addCommentMutation.mutateAsync(commentBody.trim());
      setCommentBody('');
    } catch {
      // Handled by hook error
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    try {
      await deleteCardMutation.mutateAsync(card.id);
      onClose();
    } catch {
      // Handled by error
    } finally {
      setDeleteConfirm(false);
    }
  };

  if (!cardId) return null;

  const currentPriority = card ? (typeof card.priority === 'number' ? PriorityMap[card.priority] : card.priority) : 'Medium';
  const priorityColor = PriorityColor[currentPriority] || 'var(--accent)';

  return (
    <Modal isOpen={!!cardId} onClose={onClose} title="" size="lg">
      {cardLoading || !card ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size={36} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div style={{ borderLeft: `4px solid ${priorityColor}`, paddingLeft: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>{card.columnName || 'Column'}</span>
              <ChevronRight size={12} />
              <span style={{ fontWeight: 700, color: priorityColor, textTransform: 'uppercase' }}>
                {currentPriority}
              </span>
            </div>

            {isEditing ? (
              <input
                className="form-input"
                style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0' }}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            ) : (
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 8px' }}>
                {card.title}
              </h2>
            )}

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span><User size={12} style={{ verticalAlign: 'middle' }} /> Created by {card.createdByName || 'User'}</span>
            </div>
          </div>

          {/* 409 Conflict Error Banner */}
          {conflictError && (
            <ErrorBanner
              title="Concurrency Conflict"
              message={conflictError}
              onDismiss={() => setConflictError(null)}
            />
          )}

          {cardError && (
            <ErrorBanner message="Failed to load card details." />
          )}

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
            {/* Left Column: Description & Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Description
                </h4>
                {isEditing ? (
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Add task description..."
                  />
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {card.description || <em style={{ color: 'var(--text-muted)' }}>No description provided.</em>}
                  </p>
                )}
              </div>

              {/* Editable Fields Grid */}
              <div style={{ backgroundColor: 'var(--surface-2, #0f172a)', padding: '16px', borderRadius: 'var(--radius-md, 8px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Priority */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flag size={14} /> Priority
                  </span>
                  {isEditing ? (
                    <Select
                      style={{ width: '140px' }}
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')}
                      options={[
                        { value: 'Low', label: 'Low' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'High', label: 'High' },
                        { value: 'Critical', label: 'Critical' }
                      ]}
                    />
                  ) : (
                    <span style={{ fontWeight: 600, color: priorityColor }}>{currentPriority}</span>
                  )}
                </div>

                {/* Due Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> Due Date
                  </span>
                  {isEditing ? (
                    <input
                      type="date"
                      className="form-input"
                      style={{ width: '140px', padding: '4px 8px', fontSize: '0.8125rem' }}
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-primary)' }}>
                      {card.dueDate ? new Date(card.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                  )}
                </div>

                {/* Assignee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> Assignee
                  </span>
                  {isEditing ? (
                    <Select
                      style={{ width: '140px' }}
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      options={[
                        { value: '', label: 'Unassigned' },
                        ...users.map((u) => ({ value: u.id, label: u.name }))
                      ]}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-primary)' }}>
                      {card.assignedToName || 'Unassigned'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {canEdit && (
                  isEditing ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button size="sm" leftIcon={<Save size={14} />} isLoading={patchCardMutation.isPending} onClick={handleSave}>Save</Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={startEdit}>Edit Task</Button>
                  )
                )}

                {canDelete && (
                  <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeleteConfirm(true)}>Delete</Button>
                )}
              </div>
            </div>

            {/* Right Column: Comments & Activity Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Comments Thread */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} /> Comments ({comments.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                  {commentsLoading ? (
                    <Spinner size={20} />
                  ) : comments.length === 0 ? (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet.</span>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} style={{ backgroundColor: 'var(--surface-2, #0f172a)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span>{c.authorName}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.body}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Form (Restricted per matrix) */}
                {canComment ? (
                  <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Write a comment..."
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                    <Button type="submit" size="sm" isLoading={addCommentMutation.isPending} disabled={!commentBody.trim()}>
                      Post Comment
                    </Button>
                  </form>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'var(--surface-2)', padding: '8px', borderRadius: '6px' }}>
                    Only assigned employees, HR, or Admins can comment on this task.
                  </div>
                )}
              </div>

              {/* Activity Log Panel */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> Activity ({activity.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {activity.length === 0 ? (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity logged.</span>
                  ) : (
                    activity.map((a) => {
                      const actionStr = typeof a.action === 'number' 
                        ? (ActivityActionMap[a.action] || 'updated') 
                        : a.action;
                      return (
                        <div key={a.id} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <strong>{a.actorName}</strong> {actionStr.toLowerCase()} task
                          {a.fromColumnName && a.toColumnName && ` from ${a.fromColumnName} to ${a.toColumnName}`}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Card"
        message={`Delete card "${card?.title}"? This cannot be undone.`}
        isLoading={deleteCardMutation.isPending}
      />
    </Modal>
  );
}
