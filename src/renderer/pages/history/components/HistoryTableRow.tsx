// src/renderer/pages/history/components/HistoryTableRow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Eye, Trash2, Clock, MoreVertical, BookmarkPlus } from 'lucide-react';
import type { HistoryEntry } from '../../../api/core/history';
import { formatDistanceToNow } from 'date-fns';

interface HistoryTableRowProps {
  entry: HistoryEntry;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onAddToWatchLater: () => void;
  onNavigate: () => void;
}

const HistoryTableRow: React.FC<HistoryTableRowProps> = ({
  entry,
  isSelected,
  onToggleSelect,
  onDelete,
  onAddToWatchLater,
  onNavigate,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const watchedAgo = formatDistanceToNow(new Date(entry.watchedAt), { addSuffix: true });

  // Format duration (seconds) to HH:MM:SS or MM:SS
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isSelected ? 'bg-[var(--accent-blue-light)]' : 'hover:bg-[var(--card-hover-bg)]'
      }`}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContextMenu(true);
      }}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
        />
      </div>

      {/* Thumbnail */}
      <div
        className="flex-shrink-0 w-16 h-12 rounded overflow-hidden bg-[var(--card-secondary-bg)] cursor-pointer"
        onClick={onNavigate}
      >
        {entry.thumbnail ? (
          <img src={entry.thumbnail} alt={entry.channelName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
            <Eye className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Channel & Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-[var(--sidebar-text)] cursor-pointer hover:text-[var(--primary-color)]" onClick={onNavigate}>
            {entry.channelName}
          </h4>
          {entry.type === 'vod' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--card-secondary-bg)] text-[var(--text-tertiary)]">VOD</span>
          )}
        </div>
        {entry.title && (
          <p className="text-sm text-[var(--text-secondary)] truncate">{entry.title}</p>
        )}
      </div>

      {/* Duration */}
      <div className="flex-shrink-0 text-xs text-[var(--text-tertiary)]">
        {formatDuration(entry.duration)}
      </div>

      {/* Watched time */}
      <div className="flex-shrink-0 text-xs text-[var(--text-tertiary)] w-32">
        {watchedAgo}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          onClick={onAddToWatchLater}
          className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors"
          title="Add to Watch Later"
        >
          <BookmarkPlus className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
          title="Remove from history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowContextMenu(!showContextMenu)}
            className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showContextMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-1 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 z-10"
            >
              <button
                onClick={() => {
                  onNavigate();
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)] flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> Watch again
              </button>
              <button
                onClick={() => {
                  onAddToWatchLater();
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)] flex items-center gap-2"
              >
                <BookmarkPlus className="w-4 h-4" /> Add to Watch Later
              </button>
              <hr className="my-1 border-[var(--border-color)]" />
              <button
                onClick={() => {
                  onDelete();
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[var(--card-hover-bg)] flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTableRow;