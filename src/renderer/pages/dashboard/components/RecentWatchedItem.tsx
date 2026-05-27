// src/renderer/pages/dashboard/components/RecentWatchedItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { HistoryEntry } from '../../../api/core/history';
import { formatDistanceToNow } from 'date-fns';

interface RecentWatchedItemProps {
  entry: HistoryEntry;
}

const RecentWatchedItem: React.FC<RecentWatchedItemProps> = ({ entry }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (entry.type === 'stream') {
      navigate(`/channel/${entry.channelName}`);
    } else if (entry.vodId) {
      navigate(`/vod/${entry.vodId}`);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(entry.watchedAt), { addSuffix: true });

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[var(--card-hover-bg)] transition-colors"
    >
      {entry.thumbnail && (
        <img src={entry.thumbnail} alt={entry.channelName} className="w-12 h-8 rounded object-cover bg-[var(--card-secondary-bg)]" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--sidebar-text)] truncate">{entry.channelName}</p>
        {entry.title && <p className="text-xs text-[var(--text-secondary)] truncate">{entry.title}</p>}
        <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default RecentWatchedItem;