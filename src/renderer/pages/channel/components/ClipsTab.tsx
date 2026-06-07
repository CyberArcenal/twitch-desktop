// src/renderer/pages/channel/components/ClipsTab.tsx
import React from 'react';
import type { Clip } from '../../../api/core/clips';
import { Video, TrendingUp } from 'lucide-react';
import ClipCard from '../../browse/clips/components/ClipCard';

interface ClipsTabProps {
  clips: Clip[];
  onClipClick: (clip: Clip) => void;
}

const ClipsTab: React.FC<ClipsTabProps> = ({ clips, onClipClick }) => {
  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--card-hover-bg)] flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-[var(--text-tertiary)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--sidebar-text)] mb-1">No clips yet</h3>
        <p className="text-sm text-[var(--text-secondary)]">This channel hasn't created any clips.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-[var(--primary-color)]" />
        <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">Recent Clips</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {clips.map(clip => (
          <ClipCard key={clip.id} clip={clip} onClick={onClipClick} />
        ))}
      </div>
    </div>
  );
};

export default ClipsTab;