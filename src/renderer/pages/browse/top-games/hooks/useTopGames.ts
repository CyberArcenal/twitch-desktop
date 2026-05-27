// src/renderer/pages/browse/top-games/hooks/useTopGames.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { streamsAPI, type Stream } from '../../../../api/core/streams';
import { gamesAPI } from '../../../../api/core/games';
import { showError } from '../../../../utils/notification';
import type { TopGame } from '../types';

const STREAMS_PER_PAGE = 100;
const MAX_GAMES = 100;

export const useTopGames = () => {
  const [games, setGames] = useState<TopGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const gamesRef = useRef<TopGame[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  const aggregateStreams = (streams: Stream[]) => {
    const map = new Map<string, { totalViewers: number; streamCount: number }>();
    for (const stream of streams) {
      if (!stream.game_id) continue;
      const existing = map.get(stream.game_id);
      if (existing) {
        existing.totalViewers += stream.viewer_count;
        existing.streamCount += 1;
      } else {
        map.set(stream.game_id, {
          totalViewers: stream.viewer_count,
          streamCount: 1,
        });
      }
    }
    return map;
  };

  const fetchGameInfoBatch = async (gameIds: string[]) => {
    const uniqueIds = [...new Set(gameIds)];
    const gameInfoMap = new Map<string, { name: string; boxArtUrl: string }>();
    for (const id of uniqueIds) {
      const res = await gamesAPI.getGameInfo(id);
      if (res.status && res.data) {
        gameInfoMap.set(id, {
          name: res.data.name,
          boxArtUrl: res.data.box_art_url,
        });
      }
    }
    return gameInfoMap;
  };

  const fetchGames = useCallback(async (isLoadMore = false) => {
    if (loadingRef.current) return;
    if (isLoadMore && (!hasMore || loadingMore)) return;

    loadingRef.current = true;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await streamsAPI.getTopStreams(STREAMS_PER_PAGE, cursorRef.current || undefined);
      if (!response.status || !response.data?.data) {
        throw new Error(response.message || 'Failed to fetch streams');
      }

      const streams = response.data.data;
      const newCursor = response.data.pagination?.cursor;
      const newAgg = aggregateStreams(streams);

      // Merge with current games from ref (not state)
      const currentGames = gamesRef.current;
      const combinedMap = new Map<string, { totalViewers: number; streamCount: number }>();
      for (const g of currentGames) {
        combinedMap.set(g.gameId, { totalViewers: g.totalViewers, streamCount: g.streamCount });
      }
      for (const [gameId, agg] of newAgg.entries()) {
        const existing = combinedMap.get(gameId);
        if (existing) {
          existing.totalViewers += agg.totalViewers;
          existing.streamCount += agg.streamCount;
        } else {
          combinedMap.set(gameId, agg);
        }
      }

      // Sort and limit
      let sortedGameIds = Array.from(combinedMap.keys())
        .sort((a, b) => combinedMap.get(b)!.totalViewers - combinedMap.get(a)!.totalViewers)
        .slice(0, MAX_GAMES);

      // Determine which game IDs need info (only those not already in currentGames)
      const existingIds = new Set(currentGames.map(g => g.gameId));
      const missingIds = sortedGameIds.filter(id => !existingIds.has(id));
      let gameInfoMap = new Map();
      if (missingIds.length > 0) {
        gameInfoMap = await fetchGameInfoBatch(missingIds);
      }

      // Build final games array
      const newGames: TopGame[] = sortedGameIds.map(gameId => {
        const agg = combinedMap.get(gameId)!;
        const existing = currentGames.find(g => g.gameId === gameId);
        if (existing) {
          return { ...existing, totalViewers: agg.totalViewers, streamCount: agg.streamCount };
        } else {
          const info = gameInfoMap.get(gameId);
          return {
            gameId,
            gameName: info?.name || gameId,
            boxArtUrl: info?.boxArtUrl || '',
            totalViewers: agg.totalViewers,
            streamCount: agg.streamCount,
          };
        }
      });

      setGames(newGames);
      cursorRef.current = newCursor || null;
      setHasMore(!!newCursor && newGames.length < MAX_GAMES);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      loadingRef.current = false;
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [hasMore, loadingMore]); // ✅ games is NOT in deps – break the loop!

  const loadInitial = useCallback(() => {
    cursorRef.current = null;
    setHasMore(true);
    setGames([]);
    gamesRef.current = [];
    fetchGames(false);
  }, [fetchGames]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchGames(true);
  }, [hasMore, loadingMore, loading, fetchGames]);

  // Only run once on mount
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    games,
    loading,
    loadingMore,
    error,
    hasMore,
    loadInitial,
    loadMore,
  };
};