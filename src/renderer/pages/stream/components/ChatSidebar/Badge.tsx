// src/renderer/pages/stream/components/ChatSidebar/components/Badge.tsx
import React from 'react';

interface BadgeProps {
  name: string;
  version: string;
  imageUrl: string;
}

const Badge: React.FC<BadgeProps> = ({ name, version, imageUrl }) => {
  // Only render if we have a valid image URL
  if (!imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      title={`${name} ${version}`}
      className="inline-block h-4 w-auto align-middle mr-0.5"
      onError={(e) => {
        // Hide broken badges
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};

export default Badge;