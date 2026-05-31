// src/renderer/pages/stream/components/ChatSidebar/components/Badge.tsx
import React from 'react';

interface BadgeProps {
  name: string;
  version: string;
  imageUrl: string;
}

const Badge: React.FC<BadgeProps> = ({ name, version, imageUrl }) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        title={`${name} ${version}`}
        className="inline-block h-4 w-auto align-middle mr-0.5"
        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
      />
    );
  }
  // Fallback text
  return (
    <span className="text-[10px] text-[#adadb8] bg-[#2a2a2e] px-1 rounded mr-0.5">
      {name}
    </span>
  );
};

export default Badge;