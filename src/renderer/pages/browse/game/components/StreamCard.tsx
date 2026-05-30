// src/renderer/pages/browse/game/components/StreamCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Gamepad2, Loader2, Eye } from 'lucide-react';
import type { Stream } from '../../../../api/core/games';

interface StreamCardProps {
  stream: Stream;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const thumbnailUrl = stream.thumbnail_url
    .replace('{width}', '320')
    .replace('{height}', '180');

  return (
    <Link to={`/stream/${stream.user_login}`} className="group block">
      <div className="relative bg-gradient-to-br from-[#1f1f2b] to-[#18181b] rounded-xl overflow-hidden border border-[#2a2a2e]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9147ff]/20 hover:border-[#9147ff]/50">
        {/* Thumbnail with loading */}
        <div className="relative aspect-video bg-[#0e0e10] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0e0e10] z-10">
              <Loader2 className="w-6 h-6 text-[#9147ff] animate-spin" />
            </div>
          )}
          <img
            src={thumbnailUrl}
            alt={stream.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
            } group-hover:scale-110`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          {/* Live badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg z-20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </div>
          {/* Viewer count */}
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-md z-20">
            <Eye className="w-3 h-3" />
            {stream.viewer_count.toLocaleString()}
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
            {stream.user_name}
          </h3>
          <p className="text-sm text-[#adadb8] truncate mt-0.5">{stream.title}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-[#adadb8]/80">
            <Gamepad2 className="w-3 h-3" />
            <span className="truncate">{stream.game_name}</span>
          </div>
        </div>
        {/* Hover gradient on card */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#9147ff]/0 via-[#9147ff]/0 to-[#9147ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </Link>
  );
};

export default StreamCard;