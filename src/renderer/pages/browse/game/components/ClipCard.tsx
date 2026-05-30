// src/renderer/pages/browse/game/components/ClipCard.tsx
import React, { useState } from 'react';
import { Users, Calendar, ExternalLink, Loader2, Clock } from 'lucide-react';
import type { Clip } from '../../../../api/core/clips';

interface ClipCardProps {
  clip: Clip;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const durationSeconds = clip.duration;
  const durationFormatted = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')}`;

  const openClip = () => {
    window.open(clip.url, '_blank');
  };

  return (
    <div
      onClick={openClip}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-[#1f1f2b] to-[#18181b] border border-[#2a2a2e]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9147ff]/20 hover:border-[#9147ff]/50"
    >
      {/* Thumbnail with loading */}
      <div className="relative aspect-video bg-[#0e0e10] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0e0e10] z-10">
            <Loader2 className="w-6 h-6 text-[#9147ff] animate-spin" />
          </div>
        )}
        <img
          src={clip.thumbnail_url}
          alt={clip.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
          } group-hover:scale-110`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-1.5 py-0.5 rounded-md shadow-md z-20">
          {durationFormatted}
        </div>
        {/* External link indicator */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full p-1.5 shadow-md z-20">
          <ExternalLink className="w-3 h-3 text-white" />
        </div>
        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <div className="bg-[#9147ff]/90 backdrop-blur-sm rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110 shadow-xl">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      {/* Info */}
      <div className="p-3 relative z-10">
        <h3 className="font-semibold text-white truncate group-hover:text-[#9147ff] transition-colors">
          {clip.title}
        </h3>
        <p className="text-sm text-[#adadb8] truncate mt-0.5">{clip.creator_name}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-[#adadb8]/80">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {clip.view_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(clip.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#9147ff]/0 via-[#9147ff]/0 to-[#9147ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default ClipCard;