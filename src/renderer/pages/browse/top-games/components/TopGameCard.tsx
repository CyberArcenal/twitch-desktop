// src/renderer/pages/browse/top-games/components/TopGameCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Tv } from 'lucide-react';
import type { TopGame } from '../types';

interface TopGameCardProps {
  game: TopGame;
}

const TopGameCard: React.FC<TopGameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const boxArtUrl = game.boxArtUrl
    .replace('{width}', '285')
    .replace('{height}', '380');

  const handleClick = () => {
    navigate(`/browse/game/${game.gameId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-[var(--primary-color)]"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--card-secondary-bg)]">
        <img
          src={boxArtUrl}
          alt={game.gameName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Stats overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white font-bold text-sm truncate">{game.gameName}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {game.totalViewers.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Tv className="w-3 h-3" />
            {game.streamCount} live
          </span>
        </div>
      </div>

      {/* Always visible bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm font-medium truncate">{game.gameName}</p>
      </div>
    </div>
  );
};

export default TopGameCard;