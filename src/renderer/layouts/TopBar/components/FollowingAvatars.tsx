// src/layouts/components/FollowingAvatars.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { followsAPI, type FollowedChannel } from '../../../api/core/follows';
import type { Stream } from '../../../api/core/games';
import { userAPI } from '../../../api/core/user';
import { streamsAPI } from '../../../api/core/streams';


interface FollowingChannelWithAvatar extends FollowedChannel {
  isLive: boolean;
  stream?: Stream;
  avatarUrl: string;
  avatarLoading: boolean;
}

const FollowingAvatars: React.FC = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<FollowingChannelWithAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const MAX_VISIBLE = 8;
  const avatarCache = useRef<Map<string, string>>(new Map());

  const fetchAvatar = async (login: string): Promise<string> => {
    // Check cache first
    if (avatarCache.current.has(login)) {
      return avatarCache.current.get(login)!;
    }
    try {
      const res = await userAPI.getUserByName(login);
      if (res.status && res.data?.profile_image_url) {
        const url = res.data.profile_image_url;
        avatarCache.current.set(login, url);
        return url;
      }
    } catch (err) {
      console.error(`Failed to fetch avatar for ${login}`, err);
    }
    const defaultUrl = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png';
    avatarCache.current.set(login, defaultUrl);
    return defaultUrl;
  };

  const fetchFollowing = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.status || !userRes.data) {
        setChannels([]);
        setLoading(false);
        return;
      }
      const userId = userRes.data.id;

      const followsRes = await followsAPI.get(userId);
      if (!followsRes.status) throw new Error('Failed to load follows');
      const followed: FollowedChannel[] = followsRes.data.data || [];
      if (followed.length === 0) {
        setChannels([]);
        setLoading(false);
        return;
      }

      // Get live streams for followed channels
      const streamRes = await streamsAPI.getFollowedStreams();
      const liveMap = new Map<string, Stream>();
      if (streamRes.status && streamRes.data?.data) {
        streamRes.data.data.forEach((stream: Stream) => {
          liveMap.set(stream.user_login.toLowerCase(), stream);
        });
      }

      // Build initial channel list (without avatars)
      const channelsWithStatus = followed.map((follow) => {
        const isLive = liveMap.has(follow.broadcaster_login.toLowerCase());
        const stream = isLive ? liveMap.get(follow.broadcaster_login.toLowerCase()) : undefined;
        return {
          ...follow,
          isLive,
          stream,
          avatarUrl: '',
          avatarLoading: true,
        };
      });

      // Sort: live first, then by name
      channelsWithStatus.sort((a, b) => {
        if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
        return a.broadcaster_name.localeCompare(b.broadcaster_name);
      });

      setChannels(channelsWithStatus);

      // Fetch avatars asynchronously
      const updatedChannels = [...channelsWithStatus];
      for (let i = 0; i < updatedChannels.length; i++) {
        const ch = updatedChannels[i];
        const avatarUrl = await fetchAvatar(ch.broadcaster_login);
        updatedChannels[i] = { ...ch, avatarUrl, avatarLoading: false };
        setChannels([...updatedChannels]); // update progressively
      }
    } catch (err) {
      console.error('Failed to fetch following avatars:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowing();
    const interval = setInterval(fetchFollowing, 120000); // refresh every 2 min
    return () => clearInterval(interval);
  }, [fetchFollowing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading && channels.length === 0) {
    // Show a few skeleton avatars while loading
    return (
      <div className="flex items-center gap-1.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#2a2a2e] animate-pulse" />
        ))}
      </div>
    );
  }

  if (channels.length === 0) return null;

  const visibleChannels = channels.slice(0, MAX_VISIBLE);
  const hiddenChannels = channels.slice(MAX_VISIBLE);
  const hasMore = hiddenChannels.length > 0;

  return (
    <div className="flex items-center gap-1.5">
      {visibleChannels.map((channel) => (
        <button
          key={channel.broadcaster_id}
          onClick={() => navigate(`/channel/${channel.broadcaster_login}`)}
          className="relative group flex-shrink-0 transition-transform hover:scale-110 focus:outline-none"
          title={channel.broadcaster_name}
        >
          {channel.avatarLoading ? (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#2a2a2e] animate-pulse" />
          ) : (
            <img
              src={channel.avatarUrl}
              alt={channel.broadcaster_name}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 transition-all"
              style={{
                borderColor: channel.isLive ? '#9146ff' : '#3a3a4a',
                boxShadow: channel.isLive ? '0 0 0 1px rgba(145,70,255,0.5)' : 'none',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png';
              }}
            />
          )}
          {channel.isLive && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--sidebar-bg)]" />
          )}
        </button>
      ))}

      {hasMore && (
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)] hover:text-white transition-colors text-xs font-medium"
          >
            +{hiddenChannels.length}
          </button>
          {showMore && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                More followed channels ({hiddenChannels.length})
              </div>
              {hiddenChannels.map((channel) => (
                <button
                  key={channel.broadcaster_id}
                  onClick={() => {
                    navigate(`/channel/${channel.broadcaster_login}`);
                    setShowMore(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--card-hover-bg)] transition-colors"
                >
                  {channel.avatarLoading ? (
                    <div className="w-6 h-6 rounded-full bg-[#2a2a2e] animate-pulse" />
                  ) : (
                    <img
                      src={channel.avatarUrl}
                      alt={channel.broadcaster_name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png';
                      }}
                    />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm text-[var(--sidebar-text)] truncate">{channel.broadcaster_name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {channel.isLive ? 'Live' : 'Offline'}
                    </p>
                  </div>
                  {channel.isLive && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowingAvatars;