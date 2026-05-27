// src/renderer/pages/watch-later/components/WatchLaterItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, Clock, GripVertical } from 'lucide-react';
import type { WatchLaterItem as WatchLaterItemType } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface WatchLaterItemProps {
  item: WatchLaterItemType;
  onRemove: () => void;
  onMarkAsWatched: () => void;
  dragHandleProps?: any;
}

const WatchLaterItem: React.FC<WatchLaterItemProps> = ({
  item,
  onRemove,
  onMarkAsWatched,
  dragHandleProps,
}) => {
  const navigate = useNavigate();
  const addedAgo = formatDistanceToNow(new Date(item.addedAt), { addSuffix: true });

  const handleClick = () => {
    navigate(item.url);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg hover:border-[var(--primary-color)] transition-all group">
      {/* Drag handle */}
      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-[var(--text-tertiary)] hover:text-[var(--sidebar-text)]">
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Thumbnail */}
      <div
        className="flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-[var(--card-secondary-bg)] cursor-pointer"
        onClick={handleClick}
      >
        <img src={item.thumbnail} alt={item.channelName} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
        <h3 className="font-medium text-[var(--sidebar-text)] truncate">{item.title}</h3>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span>{item.channelName}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {addedAgo}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          onClick={onMarkAsWatched}
          className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--success-color)] transition-colors"
          title="Mark as watched"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WatchLaterItem;