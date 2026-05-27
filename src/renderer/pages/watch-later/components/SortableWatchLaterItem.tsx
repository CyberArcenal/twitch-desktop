// src/renderer/pages/watch-later/components/SortableWatchLaterItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WatchLaterItem as WatchLaterItemType } from '../types';
import WatchLaterItem from './WatchLaterItem';

interface SortableWatchLaterItemProps {
  item: WatchLaterItemType;
  onRemove: () => void;
  onMarkAsWatched: () => void;
}

const SortableWatchLaterItem: React.FC<SortableWatchLaterItemProps> = ({ item, onRemove, onMarkAsWatched }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <WatchLaterItem
        item={item}
        onRemove={onRemove}
        onMarkAsWatched={onMarkAsWatched}
        dragHandleProps={listeners}
      />
    </div>
  );
};

export default SortableWatchLaterItem;