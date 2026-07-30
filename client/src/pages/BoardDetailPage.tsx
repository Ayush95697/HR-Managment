import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useBoard, useUpdateBoard, useDeleteBoard, useCreateColumn, useUpdateColumn, useDeleteColumn } from '../hooks/useBoards';
import { useCreateCard, useMoveCard } from '../hooks/useCards';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import { cardSchema, columnSchema, type CardFormData, type ColumnFormData } from '../types/schemas';
import type { TaskCard } from '../types';
import CardColumnContainer from '../components/boards/CardColumnContainer';
import CardModal from '../components/cards/CardModal';
import CardPreview from '../components/boards/CardPreview';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Modal from '../components/shared/Modal';
import ErrorBanner from '../components/shared/ErrorBanner';
import RoleGate from '../components/shared/RoleGate';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Select from '../components/shared/Select';
import toast from 'react-hot-toast';

function computeNewPosition(prevCard: TaskCard | undefined, nextCard: TaskCard | undefined): number {
  if (!prevCard && !nextCard) return 1024; // empty column, first card
  if (!prevCard) return nextCard!.position - 512; // dropped at top
  if (!nextCard) return prevCard.position + 512; // dropped at bottom
  return (prevCard.position + nextCard.position) / 2; // dropped between two cards
}

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCardId = searchParams.get('card');
  const { user } = useAuthStore();
  const role = user?.role;
  const canEdit = role === 'Admin' || role === 'HR';
  const isAdmin = role === 'Admin';

  // TanStack Query Hooks
  const { data: board, isLoading, error: boardError } = useBoard(id!);
  const { data: users = [] } = useUsers();

  const updateBoardMutation = useUpdateBoard(id!);
  const deleteBoardMutation = useDeleteBoard();
  const createColumnMutation = useCreateColumn(id!);
  const updateColumnMutation = useUpdateColumn(id!);
  const deleteColumnMutation = useDeleteColumn(id!);
  const createCardMutation = useCreateCard(id!);

  // Modals state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCardId);
  const [addCardColId, setAddCardColId] = useState<string | null>(null);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showEditBoardModal, setShowEditBoardModal] = useState(false);
  const [editColId, setEditColId] = useState<string | null>(null);
  
  const [deleteBoardConfirm, setDeleteBoardConfirm] = useState(false);
  const [deleteColumnConfirmId, setDeleteColumnConfirmId] = useState<string | null>(null);

  const [boardNameInput, setBoardNameInput] = useState('');
  const [columnNameInput, setColumnNameInput] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Drag state
  const [activeCard, setActiveCard] = useState<TaskCard | null>(null);
  const moveCard = useMoveCard(id!);

  // Sensors for @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Card Form (RHF + Zod)
  const {
    register: registerCard,
    handleSubmit: handleSubmitCard,
    reset: resetCardForm,
    watch: watchCard,
    formState: { errors: cardErrors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: { priority: 'Medium' },
  });

  // Column Form (RHF + Zod)
  const {
    register: registerCol,
    handleSubmit: handleSubmitCol,
    reset: resetColForm,
    formState: { errors: colErrors },
  } = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
  });

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    if (!board) return;
    const allCards = board.columns.flatMap((c) => c.cards);
    const card = allCards.find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !board || !canEdit) return;

    const cardId = active.id as string;
    let destColumnId = over.id as string;
    
    // Find target column directly or via the card we hovered over
    let targetColumn = board.columns.find((c) => c.id === destColumnId);
    if (!targetColumn) {
      targetColumn = board.columns.find((c) => c.cards.some((card) => card.id === destColumnId));
      if (targetColumn) destColumnId = targetColumn.id;
    }

    if (!targetColumn) return;

    const allCards = board.columns.flatMap((c) => c.cards);
    const card = allCards.find((c) => c.id === cardId);
    if (!card) return;

    const columnCards = (board.columns.find(c => c.id === destColumnId)?.cards || [])
      .filter(c => c.id !== cardId)
      .sort((a, b) => a.position - b.position);

    const overIndex = over.data.current?.sortable?.index ?? columnCards.length;
    const prevCard = columnCards[overIndex - 1];
    const nextCard = columnCards[overIndex];
    const newPosition = computeNewPosition(prevCard, nextCard);

    if (card.columnId === destColumnId && card.position === newPosition) return;

    moveCard.mutate({
      cardId,
      columnId: destColumnId,
      position: newPosition,
      rowVersion: card.rowVersion,
    });
  };

  const handleCreateCard = async (data: CardFormData) => {
    if (!addCardColId) return;
    try {
      await createCardMutation.mutateAsync({
        columnId: addCardColId,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        assignedToId: data.assignedToId || null,
      });
      setAddCardColId(null);
      resetCardForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create card');
    }
  };

  const handleAddColumn = async (data: ColumnFormData) => {
    try {
      await createColumnMutation.mutateAsync(data);
      setShowAddColumnModal(false);
      resetColForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add column');
    }
  };

  const handleEditBoard = async () => {
    if (!boardNameInput.trim()) return;
    try {
      await updateBoardMutation.mutateAsync({ name: boardNameInput.trim() });
      setShowEditBoardModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename board');
    }
  };

  const handleDeleteBoard = async () => {
    try {
      await deleteBoardMutation.mutateAsync(id!);
      navigate('/boards');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete board');
    } finally {
      setDeleteBoardConfirm(false);
    }
  };

  const handleRenameColumn = async () => {
    if (!editColId || !columnNameInput.trim()) return;
    try {
      await updateColumnMutation.mutateAsync({
        columnId: editColId,
        data: { name: columnNameInput.trim() },
      });
      setEditColId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename column');
    }
  };

  const handleDeleteColumn = async () => {
    if (!deleteColumnConfirmId) return;
    try {
      await deleteColumnMutation.mutateAsync(deleteColumnConfirmId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete column');
    } finally {
      setDeleteColumnConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (boardError || !board) {
    return <ErrorBanner title="Board Not Found" message="Could not load the requested board." />;
  }

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  const columnListProps = {
    sortedColumns,
    onAddCardClick: setAddCardColId,
    onCardClick: setSelectedCardId,
    onRenameColumnClick: (colId: string, colName: string) => {
      setEditColId(colId);
      setColumnNameInput(colName);
    },
    onDeleteColumnClick: (colId: string) => setDeleteColumnConfirmId(colId)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px - 56px)', overflow: 'hidden' }}>
      {/* Board Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/boards')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {board.name}
              </h1>
              {canEdit && (
                <button
                  onClick={() => { setBoardNameInput(board.name); setShowEditBoardModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {board.departmentName} · {board.columns.length} columns
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeleteBoardConfirm(true)}>
              Delete Board
            </Button>
          )}
          <RoleGate roles={['Admin', 'HR']}>
            <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAddColumnModal(true)}>
              Add Column
            </Button>
          </RoleGate>
        </div>
      </div>

      {conflictError && (
        <ErrorBanner title="Concurrency Warning" message={conflictError} onDismiss={() => setConflictError(null)} />
      )}

      {/* Grid rendering (Editable vs ReadOnly) */}
      {role === 'Employee' ? (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, alignItems: 'flex-start', paddingBottom: '20px' }}>
          {sortedColumns.map((column) => (
            <CardColumnContainer
              key={column.id}
              column={column}
              onAddCardClick={() => columnListProps.onAddCardClick(column.id)}
              onCardClick={(cardId) => columnListProps.onCardClick(cardId)}
              onRenameColumnClick={() => columnListProps.onRenameColumnClick(column.id, column.name)}
              onDeleteColumnClick={() => columnListProps.onDeleteColumnClick(column.id)}
            />
          ))}
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, alignItems: 'flex-start', paddingBottom: '20px' }}>
            {sortedColumns.map((column) => (
              <CardColumnContainer
                key={column.id}
                column={column}
                onAddCardClick={() => columnListProps.onAddCardClick(column.id)}
                onCardClick={(cardId) => columnListProps.onCardClick(cardId)}
                onRenameColumnClick={() => columnListProps.onRenameColumnClick(column.id, column.name)}
                onDeleteColumnClick={() => columnListProps.onDeleteColumnClick(column.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard && <CardPreview card={activeCard} isDragging={true} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* Card Detail Modal */}
      <CardModal
        cardId={selectedCardId}
        boardId={id!}
        onClose={() => {
          setSelectedCardId(null);
          if (searchParams.has('card')) {
            searchParams.delete('card');
            setSearchParams(searchParams, { replace: true });
          }
        }}
      />

      {/* Confirm Board Delete */}
      <ConfirmDialog
        isOpen={deleteBoardConfirm}
        onClose={() => setDeleteBoardConfirm(false)}
        onConfirm={handleDeleteBoard}
        title="Delete Board"
        message="Are you sure you want to delete this board? This action cannot be undone."
        isLoading={deleteBoardMutation.isPending}
      />

      {/* Confirm Column Delete */}
      <ConfirmDialog
        isOpen={!!deleteColumnConfirmId}
        onClose={() => setDeleteColumnConfirmId(null)}
        onConfirm={handleDeleteColumn}
        title="Delete Column"
        message="Delete this column and all its cards? This cannot be undone."
        isLoading={deleteColumnMutation.isPending}
      />

      {/* Add Card Modal */}
      <Modal
        isOpen={!!addCardColId}
        onClose={() => setAddCardColId(null)}
        title="Add Task Card"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddCardColId(null)}>Cancel</Button>
            <Button onClick={handleSubmitCard(handleCreateCard)} isLoading={createCardMutation.isPending}>Add Card</Button>
          </>
        }
      >
        <form onSubmit={handleSubmitCard(handleCreateCard)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Task Title</label>
            <input {...registerCard('title')} className="form-input" placeholder="e.g. Setup onboarding portal" autoFocus />
            {cardErrors.title && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{cardErrors.title.message}</span>}
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea {...registerCard('description')} className="form-textarea" rows={3} placeholder="Task details..." />
          </div>

          <div>
            <label className="form-label">Priority</label>
            <Select 
              {...registerCard('priority')} 
              value={watchCard('priority')}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' }
              ]} 
            />
          </div>

          <div>
            <label className="form-label">Assignee</label>
            <Select 
              {...registerCard('assignedToId')} 
              value={watchCard('assignedToId') ?? undefined}
              options={[
                { value: '', label: 'Unassigned' },
                ...users.map(u => ({ value: u.id, label: u.name }))
              ]} 
            />
          </div>

          <div>
            <label className="form-label">Due Date</label>
            <input {...registerCard('dueDate')} type="date" className="form-input" />
          </div>
        </form>
      </Modal>

      {/* Add Column Modal */}
      <Modal
        isOpen={showAddColumnModal}
        onClose={() => setShowAddColumnModal(false)}
        title="Add Column"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddColumnModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitCol(handleAddColumn)} isLoading={createColumnMutation.isPending}>Add</Button>
          </>
        }
      >
        <form onSubmit={handleSubmitCol(handleAddColumn)}>
          <label className="form-label">Column Name</label>
          <input {...registerCol('name')} className="form-input" placeholder="e.g. In Review" autoFocus />
          {colErrors.name && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{colErrors.name.message}</span>}
        </form>
      </Modal>

      {/* Rename Board Modal */}
      <Modal
        isOpen={showEditBoardModal}
        onClose={() => setShowEditBoardModal(false)}
        title="Rename Board"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditBoardModal(false)}>Cancel</Button>
            <Button onClick={handleEditBoard} isLoading={updateBoardMutation.isPending}>Save</Button>
          </>
        }
      >
        <div>
          <label className="form-label">Board Name</label>
          <input className="form-input" value={boardNameInput} onChange={(e) => setBoardNameInput(e.target.value)} autoFocus />
        </div>
      </Modal>

      {/* Rename Column Modal */}
      <Modal
        isOpen={!!editColId}
        onClose={() => setEditColId(null)}
        title="Rename Column"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditColId(null)}>Cancel</Button>
            <Button onClick={handleRenameColumn} isLoading={updateColumnMutation.isPending}>Save</Button>
          </>
        }
      >
        <div>
          <label className="form-label">Column Name</label>
          <input className="form-input" value={columnNameInput} onChange={(e) => setColumnNameInput(e.target.value)} autoFocus />
        </div>
      </Modal>
    </div>
  );
}
