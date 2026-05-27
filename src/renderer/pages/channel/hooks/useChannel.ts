import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI, type TwitchUser } from '../../../api/core/user';
import { followsAPI } from '../../../api/core/follows';
import { streamsAPI, type Stream } from '../../../api/core/streams';
import { clipsAPI, type Clip } from '../../../api/core/clips';
import type { Video, ScheduleSegment } from '../types';
import { showError } from '../../../utils/notification';

export const useChannel = () => {
  const { login } = useParams<{ login: string }>();
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [liveStream, setLiveStream] = useState<Stream | null>(null);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'streams' | 'clips' | 'schedule' | 'about'>('streams');

  const fetchChannelData = useCallback(async () => {
    if (!login) return;
    setLoading(true);
    try {
      // 1. Get user info
      const userRes = await userAPI.getUserByName(login);
      if (!userRes.status || !userRes.data) throw new Error('Channel not found');
      const channel = userRes.data;
      setUser(channel);

      // 2. Check if following
      const followRes = await followsAPI.isFollowing(channel.id);
      if (followRes.status) setIsFollowing(followRes.data);

      // 3. Get live stream if any
      const streamRes = await streamsAPI.getStreamByUserLogin(login);
      if (streamRes.status && streamRes.data) setLiveStream(streamRes.data);

      // 4. Get recent VODs (using Twitch API – we need videos endpoint)
      // We'll add a helper in twitchApiService: getVideos(userId, type='archive')
      // For now, we'll mock or use placeholder
      // TODO: Add videos endpoint

      // 5. Get channel clips
      const clipsRes = await clipsAPI.getClips(channel.id, 20);
      if (clipsRes.status && clipsRes.data?.data) setClips(clipsRes.data.data);

      // 6. Get schedule (requires broadcaster scope, only works for own channel)
      // We'll attempt but may fail; if fails, set empty
      try {
        // We'll add schedule API later
      } catch { /* ignore */ }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [login]);

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);

  const toggleFollow = async () => {
    if (!user) return;
    try {
      if (isFollowing) {
        await followsAPI.unfollow(user.id);
        setIsFollowing(false);
      } else {
        await followsAPI.follow(user.id);
        setIsFollowing(true);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  return {
    user,
    isFollowing,
    liveStream,
    recentVideos,
    clips,
    schedule,
    loading,
    activeTab,
    setActiveTab,
    toggleFollow,
    refresh: fetchChannelData,
  };
};