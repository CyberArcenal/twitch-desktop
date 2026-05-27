// src/renderer/pages/following/components/EmptyState.tsx
import React from 'react';
import { Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/UI/Button';

const EmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 bg-[var(--card-secondary-bg)] rounded-full flex items-center justify-center mb-4">
        <Heart className="w-12 h-12 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-[var(--sidebar-text)] mb-2">
        No followed channels yet
      </h3>
      <p className="text-[var(--text-secondary)] max-w-md mb-6">
        Follow your favorite streamers to see them here and get notified when they go live.
      </p>
      <Button
        variant="primary"
        size="md"
        onClick={() => navigate('/browse')}
        icon={Users}
      >
        Discover channels
      </Button>
    </div>
  );
};

export default EmptyState;