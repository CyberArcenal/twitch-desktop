import React from 'react';
import type { TwitchUser } from '../../../api/core/user';
import type { Stream } from '../../../api/core/streams';
import { Eye, Users, Calendar, Tv } from 'lucide-react';
import FollowButton from './FollowButton';

interface ChannelHeaderProps {
  user: TwitchUser;
  isFollowing: boolean;
  liveStream: Stream | null;
  onFollowToggle: () => void;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({ user, isFollowing, liveStream, onFollowToggle }) => {
  const bannerUrl = `https://static-cdn.jtvnw.net/jtv_user_pictures/${user.login}-channel_offline_image-1920x480.png`;
  const isLive = !!liveStream;

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-purple-900/50 to-[var(--primary-color)]/30 overflow-hidden">
        <img
          src={bannerUrl}
          alt={`${user.display_name} banner`}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>
      {/* Avatar and info */}
      <div className="px-4 md:px-6 -mt-10 mb-4 flex flex-col md:flex-row md:items-end gap-4">
        <img
          src={user.profile_image_url}
          alt={user.display_name}
          className="w-24 h-24 rounded-full border-4 border-[var(--card-bg)] bg-[var(--card-bg)]"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">{user.display_name}</h1>
            {isLive && (
              <span className="flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">@{user.login}</p>
          {isLive && liveStream && (
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-red-500">
                <Eye className="w-4 h-4" /> {liveStream.viewer_count.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                <Tv className="w-4 h-4" /> {liveStream.game_name}
              </span>
            </div>
          )}
        </div>
        <FollowButton isFollowing={isFollowing} onToggle={onFollowToggle} />
      </div>
    </div>
  );
};

export default ChannelHeader;