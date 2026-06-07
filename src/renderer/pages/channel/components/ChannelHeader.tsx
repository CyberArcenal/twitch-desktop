// src/renderer/pages/channel/components/ChannelHeader.tsx
import React, { useState } from 'react';
import type { TwitchUser } from '../../../api/core/user';
import type { Stream } from '../../../api/core/streams';
import { Eye, Users, Calendar, Tv, Verified, Sparkles } from 'lucide-react';
import FollowButton from './FollowButton';

interface ChannelHeaderProps {
  user: TwitchUser;
  isFollowing: boolean;
  liveStream: Stream | null;
  onFollowToggle: () => void;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({ user, isFollowing, liveStream, onFollowToggle }) => {
  const [bannerError, setBannerError] = useState(false);
  const isLive = !!liveStream;
  const isPartner = user.broadcaster_type === 'partner';
  const isAffiliate = user.broadcaster_type === 'affiliate';

  const bannerUrl = `https://static-cdn.jtvnw.net/jtv_user_pictures/${user.login}-channel_offline_image-1920x480.png`;
  const fallbackBanner = 'https://static-cdn.jtvnw.net/jtv_user_pictures/9c1f7e5e-2b1c-4f8c-8f6f-1c4a9c8a0b7d-channel_offline_image-1920x480.png';

  return (
    <div className="relative">
      {/* Banner with gradient overlay */}
      <div className="relative h-40 md:h-56 lg:h-64 overflow-hidden bg-gradient-to-r from-purple-900/60 to-[var(--primary-color)]/40">
        {!bannerError && (
          <img
            src={bannerUrl}
            alt={`${user.display_name} banner`}
            className="w-full h-full object-cover"
            onError={() => setBannerError(true)}
          />
        )}
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Avatar + info card (overlapping banner) */}
      <div className="px-4 md:px-8 -mt-14 mb-6 flex flex-col md:flex-row md:items-end gap-4 relative z-10">
        <div className="relative group">
          <img
            src={user.profile_image_url}
            alt={user.display_name}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[var(--card-bg)] bg-[var(--card-bg)] shadow-xl transition-transform group-hover:scale-105"
          />
          {isLive && (
            <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1.5 border-2 border-[var(--card-bg)]">
              <span className="block w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          )}
        </div>

        <div className="flex-1 pb-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              {user.display_name}
            </h1>
            {isPartner && (
              <span className="flex items-center gap-1 bg-[#9146ff]/20 text-[#9146ff] text-xs px-2 py-0.5 rounded-full border border-[#9146ff]/30">
                <Verified className="w-3 h-3" /> Partner
              </span>
            )}
            {isAffiliate && !isPartner && (
              <span className="flex items-center gap-1 bg-[#00b5b8]/20 text-[#00b5b8] text-xs px-2 py-0.5 rounded-full border border-[#00b5b8]/30">
                <Sparkles className="w-3 h-3" /> Affiliate
              </span>
            )}
            {isLive && (
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-white/80 drop-shadow-md">@{user.login}</p>

          {isLive && liveStream && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-red-400 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                <Eye className="w-4 h-4" /> {liveStream.viewer_count.toLocaleString()} viewers
              </span>
              <span className="flex items-center gap-1.5 text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                <Tv className="w-4 h-4" /> {liveStream.game_name}
              </span>
            </div>
          )}
        </div>

        <div className="pb-2">
          <FollowButton isFollowing={isFollowing} onToggle={onFollowToggle} />
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;