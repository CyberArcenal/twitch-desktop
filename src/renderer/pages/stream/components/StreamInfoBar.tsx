// src/renderer/pages/stream/components/StreamInfoBar.tsx
import React, { useState, useEffect } from 'react';
import { Users, Gamepad2, Calendar, Heart, Bookmark, Share2, Check } from 'lucide-react';
import type { Stream } from '../../../api/core/streams';
import { followsAPI } from '../../../api/core/follows';
import { watchLaterAPI, type WatchLaterItem } from '../../../api/core/watch-later';
import { showSuccess, showError } from '../../../utils/notification';

interface StreamInfoBarProps {
  stream: Stream;
  onShare?: () => void;
}

const StreamInfoBar: React.FC<StreamInfoBarProps> = ({ stream, onShare }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isWatchLaterLoading, setIsWatchLaterLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('./icon.png');

  // Fetch avatar – using Twitch API directly (bypass userAPI for now)
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!stream.user_login) return;
      console.log('[StreamInfoBar] Fetching avatar for:', stream.user_login);
      try {
        // Use the Twitch API endpoint via your backend
        const token = await window.backendAPI.auth?.({ method: 'getAccessToken' });
        const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
        const response = await fetch(
          `https://api.twitch.tv/helix/users?login=${stream.user_login}`,
          {
            headers: {
              'Authorization': `Bearer ${token?.data}`,
              'Client-Id': clientId,
            },
          }
        );
        const data = await response.json();
        const user = data.data?.[0];
        if (user?.profile_image_url) {
          setAvatarUrl(user.profile_image_url);
          console.log('[StreamInfoBar] Avatar set from API');
        } else {
          console.warn('[StreamInfoBar] No avatar from API, using fallback');
        }
      } catch (err) {
        console.error('[StreamInfoBar] Avatar fetch error:', err);
      }
    };
    fetchAvatar();
  }, [stream.user_login]);

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!stream.user_id) return;
      console.log('[StreamInfoBar] Checking follow status for:', stream.user_id);
      try {
        const res = await followsAPI.isFollowing(stream.user_id);
        console.log('[StreamInfoBar] isFollowing response:', res);
        if (res.status) setIsFollowing(res.data);
      } catch (err) {
        console.error('[StreamInfoBar] Failed to check follow status', err);
      }
    };
    checkFollowStatus();
  }, [stream.user_id]);

  // Follow/Unfollow handler
  const handleFollowToggle = async () => {
    console.log('[StreamInfoBar] Follow button CLICKED! Current isFollowing:', isFollowing);
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await followsAPI.unfollow(stream.user_id);
        console.log('[StreamInfoBar] Unfollow response:', res);
        if (res.status) {
          setIsFollowing(false);
          showSuccess(`Unfollowed ${stream.user_name}`);
        } else {
          showError(res.message);
        }
      } else {
        const res = await followsAPI.follow(stream.user_id);
        console.log('[StreamInfoBar] Follow response:', res);
        if (res.status) {
          setIsFollowing(true);
          showSuccess(`Now following ${stream.user_name}`);
        } else {
          showError(res.message);
        }
      }
    } catch (err: any) {
      console.error('[StreamInfoBar] Follow error:', err);
      showError(err.message);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleWatchLater = async () => {
    console.log('[StreamInfoBar] Watch Later button clicked');
    if (isWatchLaterLoading) return;
    setIsWatchLaterLoading(true);
    try {
      const item: Omit<WatchLaterItem, 'addedAt'> = {
        id: `stream_${stream.user_id}`,
        type: 'stream',
        channelName: stream.user_name,
        title: stream.title,
        thumbnail: stream.thumbnail_url,
        url: `/stream/${stream.user_login}`,
      };
      const res = await watchLaterAPI.add(item);
      if (res.status) showSuccess('Added to Watch Later');
      else showError(res.message);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsWatchLaterLoading(false);
    }
  };

  const handleShare = () => {
    console.log('[StreamInfoBar] Share button clicked');
    if (onShare) {
      onShare();
    } else {
      const url = `${window.location.origin}/stream/${stream.user_login}`;
      navigator.clipboard.writeText(url);
      showSuccess('Stream link copied to clipboard!');
    }
  };

  return (
    <div className="bg-[#1f1f23] border-b border-[#2a2a2e] px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Avatar + Title + Stats */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <img
            src={avatarUrl}
            className="w-10 h-10 rounded-full flex-shrink-0"
            alt={stream.user_name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.warn('[StreamInfoBar] Avatar failed, using fallback');
              (e.target as HTMLImageElement).src = './icon.png';
            }}
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-bold text-lg truncate">{stream.title}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-[#adadb8]">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{stream.user_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{stream.viewer_count?.toLocaleString()} viewers</span>
              </div>
              <div className="flex items-center gap-1">
                <Gamepad2 className="w-4 h-4" />
                <span>{stream.game_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Live since {new Date(stream.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 hidden ${
              isFollowing
                ? 'bg-[#3a3a3e] text-white hover:bg-[#4a4a4e]'
                : 'bg-[#9147ff] text-white hover:bg-[#772ce8]'
            } disabled:opacity-50 cursor-pointer`}
          >
            {isFollowing ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          <button
            onClick={handleWatchLater}
            disabled={isWatchLaterLoading}
            className="p-1.5 hover:bg-[#2a2a2e] rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            title="Watch Later"
          >
            <Bookmark className="w-5 h-5 text-[#adadb8]" />
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-[#2a2a2e] rounded-md transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-[#adadb8]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamInfoBar;