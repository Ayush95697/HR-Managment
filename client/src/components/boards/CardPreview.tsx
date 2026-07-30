import { Flag, Calendar, User, GripVertical } from 'lucide-react';
import type { TaskCard } from '../../types';
import { PriorityColor, PriorityMap } from '../../types';

interface CardPreviewProps {
  card: TaskCard;
  onClick?: () => void;
  showDragHandle?: boolean;
  isDragging?: boolean;
}

export default function CardPreview({ card, onClick, showDragHandle = false, isDragging = false }: CardPreviewProps) {
  const currentPriority = typeof card.priority === 'number' ? PriorityMap[card.priority] : card.priority;
  const priorityColor = PriorityColor[currentPriority] || 'var(--accent)';

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--surface, var(--surface))',
        border: '1px solid var(--border, var(--border))',
        borderLeft: `4px solid ${priorityColor}`,
        borderRadius: 'var(--radius-md, 8px)',
        padding: '12px',
        marginBottom: '8px',
        cursor: onClick ? 'pointer' : 'default',
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {card.title}
        </div>
        {showDragHandle && (
          <div
            className="drag-handle"
            style={{ cursor: 'grab', color: 'var(--text-muted)', padding: '2px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </div>
        )}
      </div>

      {card.description && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.description}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {card.assignedToName && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={11} /> {card.assignedToName}
            </span>
          )}
          {card.dueDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={11} /> {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <span style={{ fontWeight: 600, color: priorityColor, display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Flag size={11} /> {currentPriority}
        </span>
      </div>
    </div>
  );
}
