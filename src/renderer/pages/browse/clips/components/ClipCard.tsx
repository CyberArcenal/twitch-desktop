// src/renderer/pages/browse/clips/components/ClipCard.tsx
import React from 'react';
import { Play, Eye, Clock } from 'lucide-react';
import type { Clip } from '../../../../api/core/clips';
import { formatDistanceToNow } from 'date-fns';

interface ClipCardProps {
  clip: Clip;
  onClick: (clip: Clip) => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onClick }) => {
  const thumbnailUrl = clip.thumbnail_url;
  const createdAt = formatDistanceToNow(new Date(clip.created_at), { addSuffix: true });
  const durationSeconds = clip.duration;
  const durationFormatted = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <div
      onClick={() => onClick(clip)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-[var(--primary-color)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--card-secondary-bg)]">
        <img
          src={thumbnailUrl}
          alt={clip.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md">
          {durationFormatted}
        </div>
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-[var(--primary-color)] rounded-full p-3">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[var(--sidebar-text)] line-clamp-2 text-sm leading-tight">
          {clip.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{clip.creator_name}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {clip.view_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {createdAt}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClipCard;