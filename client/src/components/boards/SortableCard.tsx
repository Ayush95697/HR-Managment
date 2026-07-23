import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskCard } from '../../types';
import CardPreview from './CardPreview';

interface SortableCardProps {
  card: TaskCard;
  onClick: () => void;
}

export default function SortableCard({ card, onClick }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Add touch-action none to prevent scrolling while dragging on touch devices
    touchAction: 'none', 
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardPreview 
        card={card} 
        onClick={onClick} 
        showDragHandle={true} 
        isDragging={isDragging} 
      />
    </div>
  );
}
