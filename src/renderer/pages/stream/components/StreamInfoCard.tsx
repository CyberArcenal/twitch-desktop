// src/renderer/pages/stream/components/StreamInfoCard.tsx
import React, { useState, useEffect } from 'react';
import { Users, Gamepad2, Calendar, Heart, Bookmark, Share2, Check, BookmarkCheck } from 'lucide-react';
import type { Stream } from '../../../api/core/streams';
import { followsAPI } from '../../../api/core/follows';
import { watchLaterAPI, type WatchLaterItem } from '../../../api/core/watch-later';
import { showSuccess, showError } from '../../../utils/notification';

interface StreamInfoCardProps {
  stream: Stream;
  onShare?: () => void;
}

const StreamInfoCard: React.FC<StreamInfoCardProps> = ({ stream, onShare }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isWatchLaterLoading, setIsWatchLaterLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('./icon.png');

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

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <div className="flex items-start gap-3">
        <img src={avatarUrl} className="w-12 h-12 rounded-full ring-2 ring-[#9147ff]/30" alt={stream.user_name} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{stream.user_name}</h3>
          <p className="text-sm text-[#adadb8] truncate">{stream.title}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#adadb8]">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stream.viewer_count?.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> {stream.game_name}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(stream.started_at).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleFollowToggle} disabled={isFollowLoading} className={`flex-1 py-1.5 rounded-full text-sm font-medium transition ${isFollowing ? 'bg-[#3a3a4a] text-white' : 'bg-[#9147ff] text-white'}`}>
          {isFollowing ? <Check className="inline w-4 h-4 mr-1" /> : <Heart className="inline w-4 h-4 mr-1" />}
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <button onClick={handleWatchLater} disabled={isWatchLaterLoading} className={`p-1.5 rounded-full ${isWatchLater ? 'bg-[#9147ff] text-white' : 'bg-[#2a2a2e] text-[#adadb8]'}`}>
          {isWatchLater ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
        <button onClick={handleShare} className="p-1.5 rounded-full bg-[#2a2a2e] text-[#adadb8] hover:bg-[#3a3a4a]">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StreamInfoCard;