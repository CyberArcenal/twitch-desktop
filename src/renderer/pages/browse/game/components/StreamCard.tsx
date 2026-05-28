import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Gamepad2 } from 'lucide-react';
import type { Stream } from '../../../../api/core/games';

interface StreamCardProps {
  stream: Stream;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
  const thumbnailUrl = stream.thumbnail_url
    .replace('{width}', '320')
    .replace('{height}', '180');

  return (
    <Link to={`/stream/${stream.user_login}`} className="group block">
      <div className="bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all hover:scale-[1.02]">
        <div className="relative aspect-video">
          <img
            src={thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <Users className="w-3 h-3" />
            {stream.viewer_count.toLocaleString()}
          </div>
        </div>
        <div className="p-3">
          <p className="text-white font-semibold truncate">{stream.title}</p>
          <p className="text-[#adadb8] text-sm truncate">{stream.user_name}</p>
          <div className="flex items-center gap-2 text-xs text-[#adadb8] mt-1">
            <Gamepad2 className="w-3 h-3" />
            <span className="truncate">{stream.game_name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;