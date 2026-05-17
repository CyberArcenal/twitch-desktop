// src/pages/Following/components/ChannelCard.tsx
import React, { useState } from "react";
import { Tv, Eye, Gamepad2 } from "lucide-react";
import type { ChannelWithStream } from "../types";

interface ChannelCardProps {
  channel: ChannelWithStream;
  onClick: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group bg-[var(--bg-elevated)] rounded-lg overflow-hidden border border-[var(--border-default)] hover:border-[var(--twitch-purple)] transition-all cursor-pointer hover:shadow-lg"
    >
      {/* Thumbnail or placeholder */}
      <div className="relative aspect-video bg-[var(--bg-overlay)]">
        {channel.isLive && channel.stream?.thumbnailUrl && !imageError ? (
          <img
            src={channel.stream.thumbnailUrl}
            alt={channel.displayName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="w-12 h-12 text-[var(--text-tertiary)] opacity-50" />
          </div>
        )}
        {channel.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[var(--accent-live)] text-white text-xs font-bold px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}
        {channel.isLive && channel.stream && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            <Eye className="w-3 h-3" />
            {channel.stream.viewerCount.toLocaleString()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--twitch-purple)] flex items-center justify-center text-white font-bold text-sm">
            {channel.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">
              {channel.displayName}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              @{channel.login}
            </p>
          </div>
        </div>

        {channel.isLive && channel.stream && (
          <div className="mt-2">
            <p className="text-sm text-[var(--text-secondary)] truncate">
              {channel.stream.title}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-tertiary)]">
              <Gamepad2 className="w-3 h-3" />
              <span>{channel.stream.gameName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};