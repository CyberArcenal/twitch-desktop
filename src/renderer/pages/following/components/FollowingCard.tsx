// src/renderer/pages/following/components/FollowingCard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Calendar, Eye, Loader2, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { userAPI } from '../../../api/core/user';
import type { FollowingChannel } from '../types';

interface FollowingCardProps {
  channel: FollowingChannel;
}

const FollowingCard: React.FC<FollowingCardProps> = ({ channel }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarLoading, setAvatarLoading] = useState(true);
  const isLive = channel.isLive;
  const stream = channel.stream;

  // Fetch avatar dynamically
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!channel.broadcaster_login) return;
      try {
        const res = await userAPI.getUserByName(channel.broadcaster_login);
        if (res.status && res.data?.profile_image_url) {
          setAvatarUrl(res.data.profile_image_url);
        } else {
          setAvatarUrl('https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png');
        }
      } catch (err) {
        console.error('Failed to fetch avatar for', channel.broadcaster_login, err);
        setAvatarUrl('https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png');
      } finally {
        setAvatarLoading(false);
      }
    };
    fetchAvatar();
  }, [channel.broadcaster_login]);

  const handleClick = () => {
    if (isLive && stream) {
      navigate(`/stream/${stream.user_login}`);
    } else {
      navigate(`/channel/${channel.broadcaster_login}`);
    }
  };

  // Only load thumbnail if live; for offline, we show a placeholder
  const thumbnailUrl = isLive && stream?.thumbnail_url
    ? stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')
    : null;

  const followedAgo = formatDistanceToNow(new Date(channel.followed_at), { addSuffix: true });

  return (
    <div
      onClick={handleClick}
      className="group relative bg-gradient-to-br from-[#1f1f2b] to-[#18181b] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#9147ff]/20 border border-[#2a2a2e]/50 hover:border-[#9147ff]/50"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-[#0e0e10] overflow-hidden">
        {isLive ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0e0e10] z-10">
                <Loader2 className="w-6 h-6 text-[#9147ff] animate-spin" />
              </div>
            )}
            <img
              src={thumbnailUrl || ''}
              alt={channel.broadcaster_name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
              } group-hover:scale-110`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          // OFFLINE placeholder
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0e0e10]">
            <WifiOff className="w-8 h-8 text-[#adadb8] mb-2" />
            <span className="text-sm font-medium text-[#adadb8]">OFFLINE</span>
          </div>
        )}

        {/* Live badge (glassmorphic) */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </div>
        )}

        {/* Viewer count (glassmorphic) – only when live */}
        {isLive && stream && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-md z-20">
            <Eye className="w-3 h-3" />
            {stream.viewer_count.toLocaleString()}
          </div>
        )}

        {/* Hover overlay with glassy button – only when live */}
        {isLive && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <span className="text-white text-sm font-medium bg-[#9147ff]/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-105">
              Watch now →
            </span>
          </div>
        )}
      </div>

      {/* Info section with dynamic avatar */}
      <div className="p-3 flex items-start gap-3 relative z-10">
        {avatarLoading ? (
          <div className="w-10 h-10 rounded-full bg-[#2a2a2e] animate-pulse flex-shrink-0" />
        ) : (
          <img
            src={avatarUrl}
            alt={channel.broadcaster_name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#9147ff]/30 shadow-md flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate group-hover:text-[#9147ff] transition-colors duration-200">
            {channel.broadcaster_name}
          </h3>
          {isLive && stream ? (
            <p className="text-sm text-[#adadb8] truncate mt-0.5">{stream.title}</p>
          ) : (
            <p className="text-xs text-[#adadb8]/70 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> Followed {followedAgo}
            </p>
          )}
          {isLive && stream?.game_name && (
            <div className="flex items-center gap-1 mt-1 text-xs text-[#a970ff]">
              <Tv className="w-3 h-3" />
              <span className="truncate">{stream.game_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9147ff]/0 via-[#9147ff]/0 to-[#9147ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default FollowingCard;