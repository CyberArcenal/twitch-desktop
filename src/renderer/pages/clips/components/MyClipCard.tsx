// src/renderer/pages/clips/components/MyClipCard.tsx
import React from 'react';
import { Trash2, Copy, Share2, ExternalLink, Eye, Calendar } from 'lucide-react';
import type { Clip } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface MyClipCardProps {
  clip: Clip;
  onDelete: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}

const MyClipCard: React.FC<MyClipCardProps> = ({ clip, onDelete, onCopyLink, onShare }) => {
  const createdAt = formatDistanceToNow(new Date(clip.created_at), { addSuffix: true });
  const duration = `${Math.floor(clip.duration / 60)}:${(clip.duration % 60).toString().padStart(2, '0')}`;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[var(--primary-color)] transition-all group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--card-secondary-bg)]">
        <img
          src={clip.thumbnail_url}
          alt={clip.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {duration}
        </div>
        <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5 text-xs">
          {clip.view_count.toLocaleString()} views
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[var(--sidebar-text)] line-clamp-2 text-sm leading-tight">
          {clip.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-tertiary)]">
          <Calendar className="w-3 h-3" />
          <span>{createdAt}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border-color)]">
          <div className="flex gap-1">
            <button
              onClick={onCopyLink}
              className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors"
              title="Copy link"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onShare}
              className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors"
              title="Open on Twitch"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-500/20 text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
            title="Delete clip (opens Twitch dashboard)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyClipCard;