import React from 'react';
import type { Clip } from '../../../api/core/clips';
import { Eye } from 'lucide-react';

interface ClipsTabProps {
  clips: Clip[];
  onClipClick: (clip: Clip) => void;
}

const ClipsTab: React.FC<ClipsTabProps> = ({ clips, onClipClick }) => {
  if (clips.length === 0) {
    return <p className="text-center text-[var(--text-secondary)] py-8">No clips available</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
      {clips.map(clip => (
        <div
          key={clip.id}
          onClick={() => onClipClick(clip)}
          className="cursor-pointer group rounded-lg overflow-hidden bg-[var(--card-secondary-bg)] hover:scale-105 transition"
        >
          <div className="relative aspect-video">
            <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
              {Math.floor(clip.duration / 60)}:{Math.floor(clip.duration % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="p-3">
            <p className="font-medium text-[var(--sidebar-text)] line-clamp-2">{clip.title}</p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-1">
              <Eye className="w-3 h-3" /> {clip.view_count.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClipsTab;