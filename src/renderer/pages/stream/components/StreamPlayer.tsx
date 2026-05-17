// src/renderer/pages/WatchStreamPage/components/StreamPlayer.tsx
import React from 'react';
import { Eye, Gamepad2 } from 'lucide-react';
import type { StreamWithUser } from '../types';

interface StreamPlayerProps {
  stream: StreamWithUser;
  imageError: boolean;
  onImageError: () => void;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = React.memo(({
  stream,
  imageError,
  onImageError,
}) => {
  return (
    <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
      {/* Video/Thumbnail Area */}
      <div className="aspect-video w-full">
        {stream.thumbnail_url && !imageError ? (
          <img
            src={stream.thumbnail_url
              .replace('{width}', '1280')
              .replace('{height}', '720')}
            alt={stream.title}
            className="w-full h-full object-cover"
            onError={onImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-black">
            <Gamepad2 className="w-20 h-20 text-white/20" />
          </div>
        )}
      </div>

      {/* Live Badge & Overlays */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
        <Eye className="w-4 h-4" />
        <span>{stream.viewer_count.toLocaleString()} viewers</span>
      </div>
    </div>
  );
});

StreamPlayer.displayName = 'StreamPlayer';