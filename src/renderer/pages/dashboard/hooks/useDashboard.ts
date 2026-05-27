// src/renderer/pages/dashboard/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { followsAPI, type FollowedChannel } from '../../../api/core/follows';
import { streamsAPI, type Stream } from '../../../api/core/streams';
import { historyAPI, type HistoryEntry } from '../../../api/core/history';
import { userAPI } from '../../../api/core/user';
import { gamesAPI, type Game } from '../../../api/core/games';
import { showError } from '../../../utils/notification';
import type { DashboardStats, LiveFollowed, Recommendation } from '../types';

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

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

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
      setLiveChannels(topLive);
      setStats(prev => ({ ...prev, totalFollowed, liveCount: live.length }));

      // 4. Fetch watch history (last 50, then take 5 most recent)
      const historyRes = await historyAPI.get(50);
      const history = historyRes.status ? historyRes.data : [];
      const sortedHistory = [...history].sort((a, b) => 
        new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
      );
      const recent = sortedHistory.slice(0, 5);
      setRecentHistory(recent);

      // 5. Compute total hours watched (sum durations in seconds, convert to hours)
      let totalSeconds = 0;
      history.forEach(entry => {
        if (entry.duration && typeof entry.duration === 'number') {
          totalSeconds += entry.duration;
        }
      });
      const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
      setStats(prev => ({ ...prev, totalHoursWatched: totalHours }));

      // 6. Recommendations based on followed games
      // Strategy: get distinct game_ids from live streams + followed channels' recent streams?
      // Simpler: get top streams from games that the user follows (if any live)
      const followedGameIds = new Set<string>();
      for (const stream of liveStreams) {
        if (stream.game_id) followedGameIds.add(stream.game_id);
      }
      // If no live streams, fallback to top games
      let gameIdArray = Array.from(followedGameIds);
      if (gameIdArray.length === 0) {
        // No live streams among followed, just get top games overall
        const topGamesRes = await gamesAPI.getTopGames(5);
        if (topGamesRes.status && topGamesRes.data.data) {
          gameIdArray = topGamesRes.data.data.map(g => g.id);
        }
      }
      // For each game id, fetch a few streams (limit 2 per game, max 6 recos)
      const recs: Recommendation[] = [];
      for (const gameId of gameIdArray.slice(0, 3)) { // limit to 3 games
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
      // If still less than 3 recs, add some popular streams from top games
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
      setRecommendations(recs.slice(0, 6));

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refresh = useCallback(() => {
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