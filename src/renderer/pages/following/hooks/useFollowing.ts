// src/renderer/pages/following/hooks/useFollowing.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { followsAPI, type FollowedChannel} from '../../../api/core/follows';
import { userAPI } from '../../../api/core/user';
import { showError } from '../../../utils/notification';
import type { FollowingChannel, FollowingFilters } from '../types';
import { streamsAPI, type Stream } from '../../../api/core/streams';


export const useFollowing = () => {
  const [channels, setChannels] = useState<FollowingChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FollowingFilters>({
    search: '',
    status: 'all',
    sortBy: 'viewers',
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchFollowing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get current user ID
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.status || !userRes.data) {
        throw new Error('Not logged in');
      }
      const userId = userRes.data.id;

      // 2. Get all followed channels
      const followsRes = await followsAPI.get(userId);
      if (!followsRes.status) {
        throw new Error(followsRes.message || 'Failed to load followed channels');
      }
      const followed = followsRes.data.data;

      if (followed.length === 0) {
        setChannels([]);
        setLoading(false);
        return;
      }

      // 3. Fetch live streams for these channels in one API call
      const streamRes = await streamsAPI.getFollowedStreams(); // uses /streams/followed?user_id=...
      const liveMap = new Map<string, Stream>();
      if (streamRes.status && streamRes.data?.data) {
        streamRes.data.data.forEach((stream: Stream) => {
          liveMap.set(stream.user_login.toLowerCase(), stream);
        });
      }

      // 4. Merge follows with stream data
      const merged: FollowingChannel[] = followed.map((follow: FollowedChannel) => {
        const stream = liveMap.get(follow.broadcaster_login.toLowerCase());
        return {
          ...follow,
          stream: stream || null,
          isLive: !!stream,
        };
      });

      setChannels(merged);
    } catch (err: any) {
      setError(err.message || 'Failed to load following list');
      showError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFollowing();
  }, [fetchFollowing]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  // Filtering and sorting
  const filteredChannels = useMemo(() => {
    let result = [...channels];

    // Filter by status
    if (filters.status === 'live') {
      result = result.filter((ch) => ch.isLive);
    } else if (filters.status === 'offline') {
      result = result.filter((ch) => !ch.isLive);
    }

    // Filter by search (name / login)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (ch) =>
          ch.broadcaster_name.toLowerCase().includes(searchLower) ||
          ch.broadcaster_login.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => a.broadcaster_name.localeCompare(b.broadcaster_name));
        break;
      case 'viewers':
        result.sort((a, b) => (b.stream?.viewer_count || 0) - (a.stream?.viewer_count || 0));
        break;
      case 'followedAt':
        result.sort((a, b) => new Date(b.followed_at).getTime() - new Date(a.followed_at).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [channels, filters]);

  const updateFilter = <K extends keyof FollowingFilters>(key: K, value: FollowingFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      sortBy: 'viewers',
    });
  };

  return {
    channels: filteredChannels,
    rawChannels: channels,
    loading,
    refreshing,
    error,
    filters,
    updateFilter,
    resetFilters,
    refresh,
  };
};