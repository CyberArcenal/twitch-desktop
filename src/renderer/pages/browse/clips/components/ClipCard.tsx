// src/renderer/pages/browse/clips/components/ClipCard.tsx
import React, { useState } from 'react';
import { Play, Eye, Clock, Loader2 } from 'lucide-react';
import type { Clip } from '../../../../api/core/clips';
import { formatDistanceToNow } from 'date-fns';

interface ClipCardProps {
  clip: Clip;
  onClick: (clip: Clip) => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const thumbnailUrl = clip.thumbnail_url;
  const createdAt = formatDistanceToNow(new Date(clip.created_at), { addSuffix: true });
  const durationSeconds = clip.duration;
  const durationFormatted = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <div
      onClick={() => onClick(clip)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-[#1f1f2b] to-[#18181b] border border-[#2a2a2e]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9147ff]/20 hover:border-[#9147ff]/50"
    >
      {/* Thumbnail container with loading state */}
      <div className="relative aspect-video bg-[#0e0e10] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0e0e10] z-10">
            <Loader2 className="w-6 h-6 text-[#9147ff] animate-spin" />
          </div>
        )}
        <img
          src={thumbnailUrl}
          alt={clip.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
          } group-hover:scale-110`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Duration badge (glassmorphism) */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-1.5 py-0.5 rounded-md shadow-md z-20">
          {durationFormatted}
        </div>

        {/* Hover play overlay (glassy) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <div className="bg-[#9147ff]/90 backdrop-blur-sm rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110 shadow-xl">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info section with improved design */}
      <div className="p-3 relative z-10">
        <h3 className="font-semibold text-white line-clamp-2 text-sm leading-tight group-hover:text-[#9147ff] transition-colors duration-200">
          {clip.title}
        </h3>
        <p className="text-sm text-[#adadb8] mt-1 truncate">{clip.creator_name}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-[#adadb8]/80">
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

      {/* Subtle gradient overlay on hover (entire card) */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9147ff]/0 via-[#9147ff]/0 to-[#9147ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default ClipCard;