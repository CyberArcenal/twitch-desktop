// src/renderer/pages/watch-later/components/SortableWatchLaterList.tsx
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { WatchLaterItem as WatchLaterItemType } from '../types';
import SortableWatchLaterItem from './SortableWatchLaterItem';

interface SortableWatchLaterListProps {
  items: WatchLaterItemType[];
  onReorder: (items: WatchLaterItemType[]) => void;
  onRemove: (id: string) => void;
  onMarkAsWatched: (id: string) => void;
}

const SortableWatchLaterList: React.FC<SortableWatchLaterListProps> = ({
  items,
  onReorder,
  onRemove,
  onMarkAsWatched,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over?.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (items.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableWatchLaterItem
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onMarkAsWatched={() => onMarkAsWatched(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableWatchLaterList;