// src/renderer/pages/channel/components/FollowButton.tsx
import React, { useState } from 'react';
import { Heart, HeartOff, Loader2 } from 'lucide-react';
import Button from '../../../components/UI/Button';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onToggle, disabled: externalDisabled }) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleClick = async () => {
    if (internalLoading || externalDisabled) return;
    setInternalLoading(true);
    try {
      await onToggle();
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = internalLoading || externalDisabled;

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size="md"
      onClick={handleClick}
      disabled={true}
      icon={loading ? Loader2 : isFollowing ? HeartOff : Heart}
      className={`transition-all duration-200 hover:scale-105 active:scale-95 ${
        isFollowing ? 'hover:bg-red-500/10 hover:text-red-400' : ''
      }`}
    >
      {loading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton;