// src/renderer/pages/WatchStreamPage/components/StreamInfo.tsx
import React from 'react';
import { Heart, Share2, MoreVertical, Gamepad2, Users, Calendar } from 'lucide-react';
import type { StreamInfoProps } from '../types';

export const StreamInfo: React.FC<StreamInfoProps> = React.memo(({
  stream,
  user,
  isFollowing,
  onFollow,
  onShare,
  onMore,
}) => {
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const description = stream.title || 'No description available.';
  const shouldTruncate = description.length > 200;

  return (
    <div className="space-y-6">
      {/* Stream Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {stream.title}
        </h1>
      </div>

      {/* Streamer Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {stream.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">{stream.user_name}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {stream.viewer_count.toLocaleString()} watching now
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFollow}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all duration-200 ${
              isFollowing
                ? 'bg-[var(--bg-overlay)] text-white hover:bg-[var(--bg-base)]'
                : 'bg-[var(--twitch-purple)] text-white hover:bg-[var(--twitch-purple-dark)]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button
            onClick={onShare}
            className="p-2 rounded-full hover:bg-[var(--bg-overlay)] transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={onMore}
            className="p-2 rounded-full hover:bg-[var(--bg-overlay)] transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Stream Details */}
      <div className="space-y-4 p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--twitch-purple)]" />
          About this stream
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Gamepad2 className="w-4 h-4 text-[var(--twitch-purple)]" />
            <span className="text-[var(--text-primary)]">{stream.game_name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-[var(--twitch-purple)]" />
            <span className="text-[var(--text-primary)]">
              {stream.viewer_count.toLocaleString()} concurrent viewers
            </span>
          </div>
        </div>

        {/* Description with read more */}
        <div className="pt-3 border-t border-[var(--border-default)]">
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
            {shouldTruncate && !showFullDescription
              ? `${description.substring(0, 200)}... `
              : description}
            {shouldTruncate && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-[var(--twitch-purple)] hover:underline font-medium ml-1"
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
});

StreamInfo.displayName = 'StreamInfo';