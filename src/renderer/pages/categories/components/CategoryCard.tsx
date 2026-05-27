// src/renderer/pages/browse/categories/components/CategoryCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv } from 'lucide-react';
import type { Game } from '../../../api/core/games';

interface CategoryCardProps {
  game: Game;
  liveCount?: number; // optional, if we later fetch live stream count per game
}

const CategoryCard: React.FC<CategoryCardProps> = ({ game, liveCount }) => {
  const navigate = useNavigate();

  // Replace placeholder dimensions in box art URL (typically {width}x{height})
  const boxArtUrl = game.box_art_url
    .replace('{width}', '285')
    .replace('{height}', '380');

  const handleClick = () => {
    navigate(`/browse/game/${game.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-[var(--primary-color)]"
    >
      {/* Box art image */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--card-secondary-bg)]">
        <img
          src={boxArtUrl}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Overlay gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white font-bold text-sm truncate">{game.name}</p>
        {liveCount !== undefined && liveCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-white/80 mt-1">
            <Tv className="w-3 h-3" />
            <span>{liveCount.toLocaleString()} live</span>
          </div>
        )}
      </div>

      {/* Title always visible at bottom (light version) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm font-medium truncate">{game.name}</p>
      </div>
    </div>
  );
};

export default CategoryCard;