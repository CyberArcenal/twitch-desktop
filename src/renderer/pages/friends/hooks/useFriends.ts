// src/renderer/pages/friends/hooks/useFriends.ts
import { useState, useEffect, useCallback } from 'react';
import { followsAPI } from '../../../api/core/follows';
import { streamsAPI, type Stream } from '../../../api/core/streams';
import { userAPI } from '../../../api/core/user';
import type { MutualFriend } from '../types';
import { showError } from '../../../utils/notification';

export const useFriends = () => {
  const [friends, setFriends] = useState<MutualFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get current user ID
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.status || !userRes.data) throw new Error('Not logged in');
      const userId = userRes.data.id;

      // 2. Get channels you follow
      const followsRes = await followsAPI.get(userId);
      if (!followsRes.status) throw new Error(followsRes.message);
      const following = followsRes.data.data; // array of {broadcaster_id, broadcaster_login, broadcaster_name, followed_at}

      // 3. Get users who follow you (followers)
      const followersRes = await followsAPI.getFollowers(userId);
      if (!followersRes.status) throw new Error(followersRes.message);
      const followers = followersRes.data.data || []; // array of {from_id, from_login, from_name, followed_at}

      // 4. Build a set of follower IDs for quick lookup
      const followerIds = new Set(followers.map((f: { from_id: any; }) => f.from_id));

      // 5. Mutual follows = among following, those whose broadcaster_id is in followerIds
      const mutuals = following.filter(f => followerIds.has(f.broadcaster_id));

      // 6. Get profile images for these mutuals (need user info)
      const mutualIds = mutuals.map(m => m.broadcaster_id);
      let profileMap = new Map();
      for (const id of mutualIds) {
        const userInfo = await userAPI.getUserById(id);
        if (userInfo.status && userInfo.data) {
          profileMap.set(id, userInfo.data.profile_image_url);
        }
      }

      // 7. Get live streams for these mutuals
      const streamRes = await streamsAPI.getStreams(mutualIds);
      const liveMap = new Map<string, Stream>();
      if (streamRes.status && streamRes.data?.data) {
        streamRes.data.data.forEach(s => liveMap.set(s.user_id, s));
      }

      // 8. Build friend list
      const friendList: MutualFriend[] = mutuals.map(m => {
        const stream = liveMap.get(m.broadcaster_id);
        return {
          id: m.broadcaster_id,
          login: m.broadcaster_login,
          display_name: m.broadcaster_name,
          profile_image_url: profileMap.get(m.broadcaster_id) || `https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png`,
          followed_at: m.followed_at,
          isLive: !!stream,
          liveGame: stream?.game_name,
          liveTitle: stream?.title,
          viewerCount: stream?.viewer_count,
        };
      });

      setFriends(friendList);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const unfollow = useCallback(async (friendId: string) => {
    const res = await followsAPI.unfollow(friendId);
    if (res.status) {
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } else {
      showError(res.message);
    }
  }, []);

  return {
    friends,
    loading,
    error,
    refresh: fetchFriends,
    unfollow,
  };
};