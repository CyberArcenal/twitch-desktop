// src/renderer/pages/discovery/components/WatchHistoryCardSkeleton.tsx
import React from 'react';

const WatchHistoryCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] animate-pulse">
      <div className="aspect-video bg-gradient-to-r from-[#2a2a2e] via-[#3a3a4a] to-[#2a2a2e] bg-[length:200%_100%] animate-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[#2a2a2e] rounded w-3/4" />
        <div className="h-3 bg-[#2a2a2e] rounded w-full" />
        <div className="h-3 bg-[#2a2a2e] rounded w-1/3" />
      </div>
    </div>
  );
};

export default WatchHistoryCardSkeleton;