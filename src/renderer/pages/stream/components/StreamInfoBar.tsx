// src/renderer/pages/stream/components/StreamInfoBar.tsx
import React, { useState, useEffect } from 'react';
import { Users, Gamepad2, Calendar, Heart, Bookmark, Share2, Check, BookmarkCheck } from 'lucide-react';
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
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isWatchLaterLoading, setIsWatchLaterLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('./icon.png');

  // Fetch avatar using userAPI instead of raw fetch for consistency
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!stream.user_login) return;
      try {
        // Use existing userAPI or a dedicated avatar endpoint
        const { userAPI } = await import('../../../api/core/user');
        const res = await userAPI.getUserByName(stream.user_login);
        if (res.status && res.data?.profile_image_url) {
          setAvatarUrl(res.data.profile_image_url);
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
      try {
        const res = await followsAPI.isFollowing(stream.user_id);
        if (res.status) setIsFollowing(res.data);
      } catch (err) {
        console.error('[StreamInfoBar] Failed to check follow status', err);
      }
    };
    checkFollowStatus();
  }, [stream.user_id]);

  // Check if stream is already in Watch Later
  useEffect(() => {
    const checkWatchLater = async () => {
      try {
        const res = await watchLaterAPI.getAll();
        if (res.status && res.data) {
          const exists = res.data.some(item => item.id === `stream_${stream.user_id}`);
          setIsWatchLater(exists);
        }
      } catch (err) {
        console.error('[StreamInfoBar] Failed to check watch later', err);
      }
    };
    checkWatchLater();
  }, [stream.user_id]);

  // Follow/Unfollow handler
  const handleFollowToggle = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await followsAPI.unfollow(stream.user_id);
        if (res.status) {
          setIsFollowing(false);
          showSuccess(`Unfollowed ${stream.user_name}`);
        } else {
          showError(res.message);
        }
      } else {
        const res = await followsAPI.follow(stream.user_id);
        if (res.status) {
          setIsFollowing(true);
          showSuccess(`Now following ${stream.user_name}`);
        } else {
          showError(res.message);
        }
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleWatchLater = async () => {
    if (isWatchLaterLoading) return;
    setIsWatchLaterLoading(true);
    try {
      if (isWatchLater) {
        // Remove from watch later
        const id = `stream_${stream.user_id}`;
        const res = await watchLaterAPI.remove(id);
        if (res.status) {
          setIsWatchLater(false);
          showSuccess('Removed from Watch Later');
        } else {
          showError(res.message);
        }
      } else {
        const item: Omit<WatchLaterItem, 'addedAt'> = {
          id: `stream_${stream.user_id}`,
          type: 'stream',
          channelName: stream.user_name,
          title: stream.title,
          thumbnail: stream.thumbnail_url,
          url: `/stream/${stream.user_login}`,
        };
        const res = await watchLaterAPI.add(item);
        if (res.status) {
          setIsWatchLater(true);
          showSuccess('Added to Watch Later');
        } else {
          showError(res.message);
        }
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsWatchLaterLoading(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const url = `${window.location.origin}/stream/${stream.user_login}`;
      navigator.clipboard.writeText(url);
      showSuccess('Stream link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1f1f23] to-[#18181b] border-b border-[#2a2a2e] px-5 py-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Avatar + Title + Stats */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative">
            <img
              src={avatarUrl}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#9147ff]/50 shadow-md"
              alt={stream.user_name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './icon.png';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1f1f23]"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-bold text-xl leading-tight truncate">{stream.title}</h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-1.5 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">{stream.user_name}</span>
                {stream.user_name?.toLowerCase() === 'twitch' && (
                  <span className="bg-[#9147ff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Verified</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[#adadb8]">
                <Users className="w-4 h-4" />
                <span>{stream.viewer_count?.toLocaleString()} viewers</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#adadb8]">
                <Gamepad2 className="w-4 h-4" />
                <span>{stream.game_name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#adadb8]">
                <Calendar className="w-4 h-4" />
                <span>Live since {new Date(stream.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action buttons with improved design */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Follow button – only show if not current user's own stream */}
          {stream.user_login !== undefined && (
            <button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-md hidden ${
                isFollowing
                  ? 'bg-[#3a3a4a] text-white hover:bg-[#4a4a5a]'
                  : 'bg-[#9147ff] text-white hover:bg-[#772ce8]'
              } disabled:opacity-50`}
            >
              {isFollowing ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <button
            onClick={handleWatchLater}
            disabled={isWatchLaterLoading}
            className={`p-2 rounded-full transition-all duration-200 ${
              isWatchLater
                ? 'bg-[#9147ff] text-white shadow-lg shadow-[#9147ff]/30'
                : 'bg-[#2a2a2e] text-[#adadb8] hover:bg-[#3a3a4a]'
            } disabled:opacity-50`}
            title={isWatchLater ? 'Remove from Watch Later' : 'Save to Watch Later'}
          >
            {isWatchLater ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-[#2a2a2e] text-[#adadb8] hover:bg-[#3a3a4a] transition-all duration-200"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamInfoBar;