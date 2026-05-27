import React from 'react';
import { Heart, HeartOff } from 'lucide-react';
import Button from '../../../components/UI/Button';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onToggle, disabled }) => {
  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size="md"
      onClick={onToggle}
      disabled={disabled}
      icon={isFollowing ? HeartOff : Heart}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton;