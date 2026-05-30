// src/renderer/pages/browse/categories/components/CategoryCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Loader2 } from 'lucide-react';
import type { Game } from '../../../api/core/games';

interface CategoryCardProps {
  game: Game;
  liveCount?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ game, liveCount }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const boxArtUrl = game.box_art_url
    .replace('{width}', '285')
    .replace('{height}', '380');

  const handleClick = () => {
    navigate(`/browse/game/${game.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-[#1f1f2b] to-[#18181b] border border-[#2a2a2e]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9147ff]/20 hover:border-[#9147ff]/50"
    >
      {/* Box art container with loading state */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-[#0e0e10]">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0e0e10] z-10">
            <Loader2 className="w-6 h-6 text-[#9147ff] animate-spin" />
          </div>
        )}
        <img
          src={boxArtUrl}
          alt={game.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
          } group-hover:scale-110`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Hover overlay with live count (glassmorphic) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        {liveCount !== undefined && liveCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full w-fit">
            <Tv className="w-3 h-3" />
            <span>{liveCount.toLocaleString()} live</span>
          </div>
        )}
      </div>

      {/* Title always visible at bottom (glassmorphic bar) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <p className="text-white text-sm font-semibold truncate tracking-tight group-hover:text-[#9147ff] transition-colors duration-200">
          {game.name}
        </p>
      </div>

      {/* Subtle gradient overlay on hover (entire card) */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9147ff]/0 via-[#9147ff]/0 to-[#9147ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default CategoryCard;