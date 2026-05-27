// src/renderer/pages/dashboard/components/LiveChannelCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { LiveFollowed } from '../types';

interface LiveChannelCardProps {
  channel: LiveFollowed;
}

const LiveChannelCard: React.FC<LiveChannelCardProps> = ({ channel }) => {
  const navigate = useNavigate();
  const stream = channel.stream;

  const handleClick = () => {
    navigate(`/stream/${stream.user_login}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-[var(--card-hover-bg)]"
    >
      <div className="relative w-16 h-9 flex-shrink-0 rounded overflow-hidden bg-[var(--card-secondary-bg)]">
        <img
          src={stream.thumbnail_url.replace('{width}', '80').replace('{height}', '45')}
          alt={stream.user_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-br">
          LIVE
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--sidebar-text)] truncate">{stream.user_name}</p>
        <p className="text-xs text-[var(--text-secondary)] truncate">{stream.game_name}</p>
        <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
          <Eye className="w-3 h-3" />
          <span>{stream.viewer_count.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveChannelCard;