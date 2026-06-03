// src/renderer/pages/stream/components/StreamInfoCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Users, Gamepad2, Calendar, Heart, Bookmark, Share2, Check, BookmarkCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Stream } from '../../../api/core/streams';
import { followsAPI } from '../../../api/core/follows';
import { watchLaterAPI, type WatchLaterItem } from '../../../api/core/watch-later';
import { showSuccess, showError } from '../../../utils/notification';

interface StreamInfoCardProps {
  stream: Stream;
  onShare?: () => void;
}

const StreamInfoCard: React.FC<StreamInfoCardProps> = ({ stream, onShare }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isWatchLaterLoading, setIsWatchLaterLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('./icon.png');
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!stream.user_login) return;
      try {
        const { userAPI } = await import('../../../api/core/user');
        const res = await userAPI.getUserByName(stream.user_login);
        if (res.status && res.data?.profile_image_url) setAvatarUrl(res.data.profile_image_url);
      } catch (err) { console.error(err); }
    };
    fetchAvatar();
  }, [stream.user_login]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!stream.user_id) return;
      try {
        const res = await followsAPI.isFollowing(stream.user_id);
        if (res.status) setIsFollowing(res.data);
      } catch (err) { console.error(err); }
    };
    checkFollowStatus();
  }, [stream.user_id]);

  useEffect(() => {
    const checkWatchLater = async () => {
      try {
        const res = await watchLaterAPI.getAll();
        if (res.status && res.data) {
          const exists = res.data.some(item => item.id === `stream_${stream.user_id}`);
          setIsWatchLater(exists);
        }
      } catch (err) { console.error(err); }
    };
    checkWatchLater();
  }, [stream.user_id]);

  const handleFollowToggle = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await followsAPI.unfollow(stream.user_id);
        if (res.status) {
          setIsFollowing(false);
          showSuccess(`Unfollowed ${stream.user_name}`);
        } else showError(res.message);
      } else {
        const res = await followsAPI.follow(stream.user_id);
        if (res.status) {
          setIsFollowing(true);
          showSuccess(`Now following ${stream.user_name}`);
        } else showError(res.message);
      }
    } catch (err: any) { showError(err.message); }
    finally { setIsFollowLoading(false); }
  };

  const handleWatchLater = async () => {
    if (isWatchLaterLoading) return;
    setIsWatchLaterLoading(true);
    try {
      if (isWatchLater) {
        const res = await watchLaterAPI.remove(`stream_${stream.user_id}`);
        if (res.status) {
          setIsWatchLater(false);
          showSuccess('Removed from Watch Later');
        } else showError(res.message);
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
        } else showError(res.message);
      }
    } catch (err: any) { showError(err.message); }
    finally { setIsWatchLaterLoading(false); }
  };

  const handleShare = () => {
    if (onShare) onShare();
    else {
      navigator.clipboard.writeText(`${window.location.origin}/stream/${stream.user_login}`);
      showSuccess('Stream link copied!');
    }
  };

  const handleNavigateToChannel = () => {
    navigate(`/channel/${stream.user_login}`);
  };

  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  const formatViewers = (count: number) => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e] relative max-h-[165px] h-full overflow-visible">
      {/* Hover Tooltip - hindi nagbago */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-80 bg-[#18181b] border border-[#3a3a4a] rounded-xl shadow-2xl p-3 animate-fadeInUp pointer-events-none">
          <p className="text-white text-sm font-semibold break-words">{stream.title}</p>
          {stream.game_name && (
            <p className="text-[#adadb8] text-xs mt-1 flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" /> {stream.game_name}
            </p>
          )}
          <p className="text-[#adadb8] text-xs mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> {formatViewers(stream.viewer_count)} viewers
          </p>
          <p className="text-[#adadb8] text-xs mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Started {new Date(stream.started_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* Adaptive content – nag-iiba ang layout depende sa available width */}
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Avatar – lumiliit kapag sobrang sikip */}
        <button
          onClick={handleNavigateToChannel}
          className="flex-shrink-0 transition-transform hover:scale-105 focus:outline-none"
        >
          <img
            src={avatarUrl}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-[#9147ff]/30 hover:ring-[#9147ff] transition-all"
            alt={stream.user_name}
          />
        </button>

        <div className="flex-1 min-w-0">
          {/* Channel name – may truncation at responsive text size */}
          <button
            onClick={handleNavigateToChannel}
            className="font-bold text-white hover:text-[#9147ff] transition-colors text-left truncate block w-full focus:outline-none text-sm sm:text-base"
          >
            {stream.user_name}
          </button>

          {/* Title – pinaikli ang font sa sobrang sikip */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="cursor-help"
          >
            <p className="text-xs sm:text-sm text-[#adadb8] truncate">{stream.title}</p>
          </div>

          {/* Stats – nagsisiksikan o nagwo-wrap kung kinakailangan */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] sm:text-xs text-[#adadb8]">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">{formatViewers(stream.viewer_count)}</span>
              <span className="xs:hidden">{formatViewers(stream.viewer_count)}</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap overflow-hidden">
              <Gamepad2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{stream.game_name}</span>
              <span className="sm:hidden truncate max-w-[60px]">{stream.game_name}</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden md:inline">{new Date(stream.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="md:hidden">{new Date(stream.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).slice(0,5)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons – adaptive spacing at laki */}
      <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
        <button
          onClick={handleFollowToggle}
          disabled={isFollowLoading}
          className={`flex-1 py-1 px-1 sm:px-2 rounded-full text-[11px] sm:text-sm font-medium transition ${
            isFollowing ? 'bg-[#3a3a4a] text-white hover:bg-[#4a4a5a]' : 'bg-[#9147ff] text-white hover:bg-[#772ce8]'
          } disabled:opacity-50 flex items-center justify-center gap-0.5 sm:gap-1`}
        >
          {isFollowing ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Heart className="w-3 h-3 sm:w-4 sm:h-4" />}
          <span className="hidden xs:inline">{isFollowing ? 'Following' : 'Follow'}</span>
          <span className="xs:hidden">{isFollowing ? '✓' : '+'}</span>
        </button>
        <button
          onClick={handleWatchLater}
          disabled={isWatchLaterLoading}
          className={`p-1 sm:p-1.5 rounded-full transition ${
            isWatchLater ? 'bg-[#9147ff] text-white' : 'bg-[#2a2a2e] text-[#adadb8] hover:bg-[#3a3a4a]'
          } disabled:opacity-50`}
          title={isWatchLater ? 'Remove from Watch Later' : 'Save to Watch Later'}
        >
          {isWatchLater ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        <button
          onClick={handleShare}
          className="p-1 sm:p-1.5 rounded-full bg-[#2a2a2e] text-[#adadb8] hover:bg-[#3a3a4a] transition"
          title="Share"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default StreamInfoCard;