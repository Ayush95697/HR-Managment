import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { BoardColumn } from '../../types';
import SortableCard from './SortableCard';
import RoleGate from '../shared/RoleGate';

interface CardColumnContainerProps {
  column: BoardColumn;
  onAddCardClick: () => void;
  onCardClick: (cardId: string) => void;
  onRenameColumnClick: () => void;
  onDeleteColumnClick: () => void;
}

export default function CardColumnContainer({
  column,
  onAddCardClick,
  onCardClick,
  onRenameColumnClick,
  onDeleteColumnClick,
}: CardColumnContainerProps) {
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const cards = column.cards ? [...column.cards].sort((a, b) => a.position - b.position) : [];
  const cardIds = cards.map((c) => c.id);

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-2, #0f172a)',
        border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
        borderRadius: 'var(--radius-lg, 12px)',
        width: '300px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent, #3B82F6)' }} />
          {column.name}
          <span style={{ backgroundColor: 'var(--surface, #1e293b)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {cards.length}
          </span>
        </div>

        {/* Column Settings Menu (Admin & HR) */}
        <RoleGate roles={['Admin', 'HR']}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--surface, #1e293b)',
                  border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
                  borderRadius: 'var(--radius-md, 8px)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  minWidth: '130px',
                  padding: '4px',
                }}
                onClick={() => setShowMenu(false)}
              >
                <button
                  onClick={onRenameColumnClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  <Pencil size={14} /> Rename
                </button>
                <button
                  onClick={onDeleteColumnClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'none', color: 'var(--danger, #ef4444)', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </RoleGate>
      </div>

      {/* Droppable Card List Area */}
      <div
        ref={setNodeRef}
        style={{
          padding: '12px',
          flex: 1,
          overflowY: 'auto',
          minHeight: '100px',
          backgroundColor: isOver ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
          transition: 'background-color 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.length === 0 && (
            <div
              style={{
                border: '2px dashed var(--border, rgba(255, 255, 255, 0.1))',
                borderRadius: 'var(--radius-md, 8px)',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
                backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              }}
            >
              Drop cards here
            </div>
          )}
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Card Button (Admin & HR only) */}
      <RoleGate roles={['Admin', 'HR']}>
        <button
          onClick={onAddCardClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
            padding: '12px',
            border: 'none',
            borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            borderBottomLeftRadius: 'var(--radius-lg, 12px)',
            borderBottomRightRadius: 'var(--radius-lg, 12px)',
          }}
        >
          <Plus size={14} /> Add card
        </button>
      </RoleGate>
    </div>
  );
}
