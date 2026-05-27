// src/renderer/pages/following/components/FollowingCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Users, Calendar, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { FollowingChannel } from '../types';

interface FollowingCardProps {
  channel: FollowingChannel;
}

const FollowingCard: React.FC<FollowingCardProps> = ({ channel }) => {
  const navigate = useNavigate();
  const isLive = channel.isLive;
  const stream = channel.stream;

  const handleClick = () => {
    if (isLive && stream) {
      navigate(`/stream/${stream.user_login}`);
    } else {
      navigate(`/channel/${channel.broadcaster_login}`);
    }
  };

  const thumbnailUrl = isLive && stream?.thumbnail_url
    ? stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')
    : `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.broadcaster_login}-320x180.jpg`;

  const followedAgo = formatDistanceToNow(new Date(channel.followed_at), { addSuffix: true });

  return (
    <div
      onClick={handleClick}
      className="group relative bg-[var(--card-bg)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-[var(--border-color)] hover:border-[var(--primary-color)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--card-secondary-bg)]">
        <img
          src={thumbnailUrl}
          alt={channel.broadcaster_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </div>
        )}
        {/* Viewer count (live only) */}
        {isLive && stream && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {stream.viewer_count.toLocaleString()}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-sm font-medium bg-[var(--primary-color)] px-3 py-1 rounded-full">
            Watch now →
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-start gap-3">
        <img
          src={`https://static-cdn.jtvnw.net/jtv_user_pictures/${channel.broadcaster_login}-profile_image-70x70.png`}
          alt={channel.broadcaster_name}
          className="w-10 h-10 rounded-full border-2 border-[var(--border-color)]"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png';
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--sidebar-text)] truncate">
            {channel.broadcaster_name}
          </h3>
          {isLive && stream ? (
            <p className="text-xs text-[var(--text-secondary)] truncate">{stream.title}</p>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Followed {followedAgo}
            </p>
          )}
          {isLive && stream?.game_name && (
            <div className="flex items-center gap-1 mt-1 text-xs text-[var(--accent-purple)]">
              <Tv className="w-3 h-3" />
              <span className="truncate">{stream.game_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingCard;