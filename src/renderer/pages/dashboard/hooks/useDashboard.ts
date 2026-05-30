// src/renderer/pages/dashboard/hooks/useDashboard.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { followsAPI, type FollowedChannel } from '../../../api/core/follows';
import { streamsAPI, type Stream } from '../../../api/core/streams';
import { historyAPI, type HistoryEntry } from '../../../api/core/history';
import { userAPI } from '../../../api/core/user';
import { gamesAPI, type Game } from '../../../api/core/games';
import { showError } from '../../../utils/notification';
import type { DashboardStats, LiveFollowed, Recommendation } from '../types';

// Cache keys
const CACHE_KEY = 'dashboard_cache';
const CACHE_TIMESTAMP_KEY = 'dashboard_cache_timestamp';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedDashboardData {
  liveChannels: LiveFollowed[];
  recommendations: Recommendation[];
  recentHistory: HistoryEntry[];
  stats: DashboardStats;
}

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveChannels, setLiveChannels] = useState<LiveFollowed[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFollowed: 0,
    totalHoursWatched: 0,
    liveCount: 0,
  });

  // Ref to track if we already loaded cache to avoid double render
  const cacheLoaded = useRef(false);

  // Load cached data immediately on mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          if (age < CACHE_TTL) {
            const data: CachedDashboardData = JSON.parse(cached);
            setLiveChannels(data.liveChannels);
            setRecommendations(data.recommendations);
            setRecentHistory(data.recentHistory);
            setStats(data.stats);
            setLoading(false);
            cacheLoaded.current = true;
          }
        }
      } catch (err) {
        console.warn('Failed to load dashboard cache', err);
      }
    };
    loadCachedData();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Get current user ID
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.status || !userRes.data) {
        throw new Error('Not logged in');
      }
      const userId = userRes.data.id;

      // 2. Fetch followed channels
      const followsRes = await followsAPI.get(userId);
      if (!followsRes.status) {
        throw new Error(followsRes.message || 'Failed to load followed channels');
      }
      const followed = followsRes.data.data;
      const totalFollowed = followed.length;

      // 3. Fetch live streams among followed
      const streamRes = await streamsAPI.getFollowedStreams(100);
      const liveStreams: Stream[] = streamRes.status && streamRes.data?.data ? streamRes.data.data : [];
      const liveMap = new Map<string, Stream>();
      liveStreams.forEach(s => liveMap.set(s.user_login.toLowerCase(), s));

      // Build liveChannels array
      const live: LiveFollowed[] = [];
      for (const channel of followed) {
        const stream = liveMap.get(channel.broadcaster_login.toLowerCase());
        if (stream) {
          live.push({ ...channel, stream });
        }
      }
      // Sort by viewer count descending, take top 5
      const topLive = [...live].sort((a, b) => b.stream.viewer_count - a.stream.viewer_count).slice(0, 5);
      
      // Update stats
      const newStats = { totalFollowed, totalHoursWatched: 0, liveCount: live.length };

      // 4. Fetch watch history (last 50)
      const historyRes = await historyAPI.get(50);
      const history = historyRes.status ? historyRes.data : [];
      const sortedHistory = [...history].sort((a, b) => 
        new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
      );
      const recent = sortedHistory.slice(0, 5);

      // 5. Compute total hours watched
      let totalSeconds = 0;
      history.forEach(entry => {
        if (entry.duration && typeof entry.duration === 'number') {
          totalSeconds += entry.duration;
        }
      });
      const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
      newStats.totalHoursWatched = totalHours;

      // 6. Recommendations
      const followedGameIds = new Set<string>();
      for (const stream of liveStreams) {
        if (stream.game_id) followedGameIds.add(stream.game_id);
      }
      let gameIdArray = Array.from(followedGameIds);
      if (gameIdArray.length === 0) {
        const topGamesRes = await gamesAPI.getTopGames(5);
        if (topGamesRes.status && topGamesRes.data.data) {
          gameIdArray = topGamesRes.data.data.map(g => g.id);
        }
      }
      const recs: Recommendation[] = [];
      for (const gameId of gameIdArray.slice(0, 3)) {
        const streamsByGameRes = await gamesAPI.getStreamsByGame(gameId, 2);
        if (streamsByGameRes.status && streamsByGameRes.data.data) {
          for (const stream of streamsByGameRes.data.data) {
            recs.push({
              id: stream.id,
              type: 'stream',
              title: stream.user_name,
              subtitle: stream.title,
              thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
              url: `/stream/${stream.user_login}`,
            });
          }
        }
      }
      if (recs.length < 3) {
        const topGamesRes = await gamesAPI.getTopGames(5);
        if (topGamesRes.status && topGamesRes.data.data) {
          for (const game of topGamesRes.data.data.slice(0, 3)) {
            if (recs.length >= 6) break;
            const streamsRes = await gamesAPI.getStreamsByGame(game.id, 1);
            if (streamsRes.status && streamsRes.data.data?.[0]) {
              const s = streamsRes.data.data[0];
              recs.push({
                id: s.id,
                type: 'stream',
                title: s.user_name,
                subtitle: s.title,
                thumbnail: s.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
                url: `/stream/${s.user_login}`,
              });
            }
          }
        }
      }
      const finalRecs = recs.slice(0, 6);

      // Update state with fresh data
      setLiveChannels(topLive);
      setRecommendations(finalRecs);
      setRecentHistory(recent);
      setStats(newStats);
      setLoading(false);
      setError(null);

      // Save to cache
      const cacheData: CachedDashboardData = {
        liveChannels: topLive,
        recommendations: finalRecs,
        recentHistory: recent,
        stats: newStats,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      showError(err.message);
      setLoading(false);
    }
  }, []);

  // Fetch fresh data only if cache was not loaded (or always fetch in background)
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refresh = useCallback(() => {
    // Force refresh – clear cache and fetch fresh
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    setLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    liveChannels,
    recommendations,
    recentHistory,
    stats,
    refresh,
  };
};