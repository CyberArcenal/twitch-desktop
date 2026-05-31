// src/renderer/pages/dashboard/components/RecentWatchedItem.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, Loader2 } from 'lucide-react';
import type { HistoryEntry } from '../../../api/core/history';
import { formatDistanceToNow } from 'date-fns';

interface RecentWatchedItemProps {
  entry: HistoryEntry;
}

const RecentWatchedItem: React.FC<RecentWatchedItemProps> = ({ entry }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

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
      className="group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[var(--card-hover-bg)] hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Thumbnail with modern design */}
      <div className="relative w-14 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--card-secondary-bg)] shadow-md">
        {!imageLoaded && entry.thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-[var(--primary-color)] animate-spin" />
          </div>
        )}
        {entry.thumbnail ? (
          <img
            src={entry.thumbnail}
            alt={entry.channelName}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-[var(--text-tertiary)]" />
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--sidebar-text)] truncate group-hover:text-[var(--primary-color)] transition-colors">
          {entry.channelName}
        </p>
        {entry.title && (
          <p className="text-xs text-[var(--text-secondary)] truncate">{entry.title}</p>
        )}
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
          <span className="text-xs text-[var(--text-tertiary)]">{timeAgo}</span>
          {entry.duration && (
            <>
              <span className="text-[var(--text-tertiary)] text-xs">•</span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {Math.floor(entry.duration / 60)} min
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentWatchedItem;