// src/renderer/pages/browse/live/components/LiveStreamCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Gamepad2 } from 'lucide-react';
import type { Stream } from '../../../../api/core/streams';

interface LiveStreamCardProps {
  stream: Stream;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ stream }) => {
  const navigate = useNavigate();
  const thumbnailUrl = stream.thumbnail_url
    .replace('{width}', '320')
    .replace('{height}', '180');

  const handleClick = () => {
    navigate(`/stream/${stream.user_login}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-[var(--primary-color)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--card-secondary-bg)]">
        <img
          src={thumbnailUrl}
          alt={stream.user_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Live badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          LIVE
        </div>
        {/* Viewer count */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {stream.viewer_count.toLocaleString()}
        </div>
        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-[var(--primary-color)] rounded-full p-2">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[var(--sidebar-text)] truncate">{stream.user_name}</h3>
        <p className="text-sm text-[var(--text-secondary)] truncate">{stream.title}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-tertiary)]">
          <Gamepad2 className="w-3 h-3" />
          <span className="truncate">{stream.game_name}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamCard;