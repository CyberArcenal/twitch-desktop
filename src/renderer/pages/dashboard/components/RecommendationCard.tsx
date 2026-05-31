// src/renderer/pages/dashboard/components/RecommendationCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import type { Recommendation } from '../types';

interface RecommendationCardProps {
  rec: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={() => navigate(rec.url)}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-[var(--card-secondary-bg)] transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-[var(--primary-color)]/10"
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-secondary-bg)]">
            <Loader2 className="w-5 h-5 text-[var(--primary-color)] animate-spin" />
          </div>
        )}
        <img
          src={rec.thumbnail}
          alt={rec.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
          <div className="bg-[var(--primary-color)] rounded-full p-2.5 shadow-xl transform transition-transform group-hover:scale-110">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-2.5">
        <p className="font-medium text-sm text-[var(--sidebar-text)] truncate leading-tight">
          {rec.title}
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
          {rec.subtitle}
        </p>
      </div>
    </div>
  );
};

export default RecommendationCard;