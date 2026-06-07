// src/renderer/pages/discovery/components/LiveStreamCardSkeleton.tsx
import React from 'react';

const LiveStreamCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl overflow-hidden bg-[#1f1f23] border border-[#2a2a2e]">
      {/* Thumbnail placeholder - static gray */}
      <div className="aspect-video bg-[#2a2a2e]" />
      
      <div className="p-3 flex gap-2">
        {/* Avatar placeholder */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2a2a2e]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#2a2a2e] rounded w-3/4" />
          <div className="h-3 bg-[#2a2a2e] rounded w-full" />
          <div className="h-3 bg-[#2a2a2e] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default LiveStreamCardSkeleton;