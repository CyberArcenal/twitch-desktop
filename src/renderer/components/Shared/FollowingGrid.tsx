// src/renderer/pages/following/components/FollowingGrid.tsx
import React from 'react';
import FollowingCard from '../../pages/following/components/FollowingCard';
import type { FollowingChannel } from '../../pages/following/types';

interface FollowingGridProps {
  channels: FollowingChannel[];
}

const FollowingGrid: React.FC<FollowingGridProps> = ({ channels }) => {
  if (channels.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr">
      {channels.map((channel) => (
        <FollowingCard key={channel.broadcaster_id} channel={channel} />
      ))}
    </div>
  );
};

export default FollowingGrid;