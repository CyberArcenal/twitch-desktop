import React from 'react';
import { Users, Calendar, ExternalLink } from 'lucide-react';
import type { Clip } from '../../../../api/core/clips';

interface ClipCardProps {
  clip: Clip;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip }) => {
  const openClip = () => {
    window.open(clip.url, '_blank');
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all cursor-pointer group" onClick={openClip}>
      <div className="relative aspect-video">
        <img
          src={clip.thumbnail_url}
          alt={clip.title}
          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
        />
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Users className="w-3 h-3" />
          {clip.view_count.toLocaleString()}
        </div>
        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
      <div className="p-3">
        <p className="text-white font-semibold truncate">{clip.title}</p>
        <p className="text-[#adadb8] text-sm truncate">{clip.creator_name}</p>
        <div className="flex items-center gap-2 text-xs text-[#adadb8] mt-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(clip.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ClipCard;