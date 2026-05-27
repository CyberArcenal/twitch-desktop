// src/renderer/pages/dashboard/components/RecommendationCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { Recommendation } from '../types';

interface RecommendationCardProps {
  rec: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(rec.url)}
      className="group relative cursor-pointer rounded-lg overflow-hidden bg-[var(--card-secondary-bg)] transition-all hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="aspect-video relative">
        <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="p-2">
        <p className="font-medium text-sm text-[var(--sidebar-text)] truncate">{rec.title}</p>
        <p className="text-xs text-[var(--text-secondary)] truncate">{rec.subtitle}</p>
      </div>
    </div>
  );
};

export default RecommendationCard;