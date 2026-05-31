// src/renderer/pages/dashboard/components/LiveChannelCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Gamepad2, Loader2 } from 'lucide-react';
import type { LiveFollowed } from '../types';

interface LiveChannelCardProps {
  channel: LiveFollowed;
}

const LiveChannelCard: React.FC<LiveChannelCardProps> = ({ channel }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const stream = channel.stream;
  
  const thumbnailUrl = stream.thumbnail_url
    .replace('{width}', '160')
    .replace('{height}', '90');

  const handleClick = () => {
    navigate(`/stream/${stream.user_login}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[var(--card-hover-bg)] hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Thumbnail with loading state */}
      <div className="relative w-20 h-11 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--card-secondary-bg)] shadow-md">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-[var(--primary-color)] animate-spin" />
          </div>
        )}
        <img
          src={thumbnailUrl}
          alt={stream.user_name}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Live badge */}
        <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-md shadow-md">
          LIVE
        </div>
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--sidebar-text)] truncate group-hover:text-[var(--primary-color)] transition-colors">
          {stream.user_name}
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate">{stream.game_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
            <Eye className="w-3 h-3" />
            <span>{stream.viewer_count.toLocaleString()}</span>
          </div>
          <span className="text-[var(--text-tertiary)] text-xs">•</span>
          <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
            <Gamepad2 className="w-3 h-3" />
            <span className="truncate">{stream.game_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChannelCard;