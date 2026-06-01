// src/renderer/pages/discovery/hooks/useDiscoveryData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { gamesAPI, type Game, type Stream } from '../../../api/core/games';
import { historyAPI, type HistoryEntry } from '../../../api/core/history';
import { authAPI } from '../../../api/core/auth';
import { streamsAPI } from '../../../api/core/streams';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  TOP_STREAMS: 'discovery_topStreams',
  CATEGORIES: 'discovery_categories',
};

interface CachedData<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const cached: CachedData<T> = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  const cache: CachedData<T> = { data, timestamp: Date.now() };
  localStorage.setItem(key, JSON.stringify(cache));
}

interface UseDiscoveryDataReturn {
  topStreams: Stream[];
  categories: Game[];
  watchHistory: HistoryEntry[];
  isLoggedIn: boolean;
  loadingStreams: boolean;
  loadingCategories: boolean;
  loadingHistory: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDiscoveryData = (): UseDiscoveryDataReturn => {
  // States
  const [topStreams, setTopStreams] = useState<Stream[]>([]);
  const [categories, setCategories] = useState<Game[]>([]);
  const [watchHistory, setWatchHistory] = useState<HistoryEntry[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if background refresh should skip loading states
  const isBackgroundRefresh = useRef(false);

  const fetchData = useCallback(async (isBackground: boolean = false) => {
    setError(null);

    // Only set loading true if this is NOT a background refresh
    if (!isBackground) {
      setLoadingStreams(true);
      setLoadingCategories(true);
      setLoadingHistory(true);
    }

    // Auth check
    let loggedIn = false;
    try {
      const authRes = await authAPI.isLoggedIn();
      loggedIn = authRes.data;
      setIsLoggedIn(loggedIn);
    } catch (err) {
      console.error('Auth check failed', err);
    }

    // --- Fetch top streams ---
    try {
      const streamsRes = await streamsAPI.getTopStreams(20);
      if (streamsRes.status && streamsRes.data?.data) {
        setTopStreams(streamsRes.data.data);
        setCache(CACHE_KEYS.TOP_STREAMS, streamsRes.data.data);
      } else {
        throw new Error(streamsRes.message || 'Failed to fetch streams');
      }
    } catch (err: any) {
      if (!isBackground) setError(err.message);
      console.error(err);
    } finally {
      if (!isBackground) setLoadingStreams(false);
    }

    // --- Fetch top games (categories) ---
    try {
      const gamesRes = await gamesAPI.getTopGames(20);
      if (gamesRes.status && gamesRes.data?.data) {
        setCategories(gamesRes.data.data);
        setCache(CACHE_KEYS.CATEGORIES, gamesRes.data.data);
      } else {
        throw new Error(gamesRes.message || 'Failed to fetch games');
      }
    } catch (err: any) {
      if (!isBackground) setError(err.message);
      console.error(err);
    } finally {
      if (!isBackground) setLoadingCategories(false);
    }

    // --- Fetch watch history (only if logged in, no cache for personal data) ---
    if (loggedIn) {
      try {
        const historyRes = await historyAPI.get(20);
        if (historyRes.status && historyRes.data) {
          setWatchHistory(historyRes.data);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        if (!isBackground) setLoadingHistory(false);
      }
    } else {
      setWatchHistory([]);
      if (!isBackground) setLoadingHistory(false);
    }
  }, []);

  // On mount: load cached data first, then fetch fresh in background
  useEffect(() => {
    // Load from cache
    const cachedStreams = getCached<Stream[]>(CACHE_KEYS.TOP_STREAMS);
    if (cachedStreams) {
      setTopStreams(cachedStreams);
      setLoadingStreams(false);
    }
    const cachedCategories = getCached<Game[]>(CACHE_KEYS.CATEGORIES);
    if (cachedCategories) {
      setCategories(cachedCategories);
      setLoadingCategories(false);
    }

    // If cache exists, we still want fresh data in background (no loading spinners)
    if (cachedStreams || cachedCategories) {
      isBackgroundRefresh.current = true;
      fetchData(true).finally(() => {
        isBackgroundRefresh.current = false;
      });
    } else {
      // No cache – normal loading with spinners
      fetchData(false);
    }
  }, [fetchData]);

  // Public refetch method (always shows loading spinners)
  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    topStreams,
    categories,
    watchHistory,
    isLoggedIn,
    loadingStreams,
    loadingCategories,
    loadingHistory,
    error,
    refetch,
  };
};