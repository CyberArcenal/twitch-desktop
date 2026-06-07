// src/renderer/pages/browse/live/hooks/useBrowseLive.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { streamsAPI, type Stream } from '../../../../api/core/streams';
import { gamesAPI, type Game } from '../../../../api/core/games';
import { showError } from '../../../../utils/notification';
import type { FilterState, LanguageOption } from '../types';

const STREAMS_PER_PAGE = 50;

export const useBrowseLive = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ gameId: '', language: '' });

  // Refs to avoid dependency loops
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Sync ref with state
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Load games for filter dropdown
  const loadGames = useCallback(async () => {
    setGamesLoading(true);
    try {
      const res = await gamesAPI.getTopGames(100);
      if (res.status && res.data?.data) {
        setGames(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load games', err);
    } finally {
      setGamesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Core fetch function – stable, depends only on filters
  const fetchStreams = useCallback(
    async (isLoadMore = false, resetFilters = false) => {
      if (loadingRef.current) return;
      if (isLoadMore && (!hasMoreRef.current || loadingMore)) return;

      loadingRef.current = true;
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await streamsAPI.getTopStreamsWithFilters(
          STREAMS_PER_PAGE,
          isLoadMore ? cursorRef.current || undefined : undefined,
          filters.gameId || undefined,
          filters.language || undefined
        );

        if (!response.status || !response.data?.data) {
          throw new Error(response.message || 'Failed to fetch streams');
        }

        const newStreams = response.data.data;
        const newCursor = response.data.pagination?.cursor;

        if (resetFilters || !isLoadMore) {
          setStreams(newStreams);
          cursorRef.current = newCursor || null;
          setHasMore(!!newCursor && newStreams.length === STREAMS_PER_PAGE);
          setTotal(newStreams.length);
        } else {
          setStreams((prev) => [...prev, ...newStreams]);
          cursorRef.current = newCursor || null;
          setHasMore(!!newCursor && newStreams.length === STREAMS_PER_PAGE);
          setTotal((prev) => prev + newStreams.length);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load live streams');
        showError(err.message);
      } finally {
        loadingRef.current = false;
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [filters.gameId, filters.language, loadingMore] // loadingMore is safe; it doesn't change on every load
  );

  // Initial load
  const loadInitial = useCallback(() => {
    cursorRef.current = null;
    setHasMore(true);
    hasMoreRef.current = true;
    setStreams([]);
    fetchStreams(false, true);
  }, [fetchStreams]);

  // Load more
  const loadMore = useCallback(() => {
    if (!hasMoreRef.current || loadingMore || loading) return;
    fetchStreams(true, false);
  }, [loadingMore, loading, fetchStreams]);

  // Update filter
  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      cursorRef.current = null;
      setHasMore(true);
      hasMoreRef.current = true;
      setStreams([]);
      fetchStreams(false, true);
    },
    [fetchStreams]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({ gameId: '', language: '' });
    cursorRef.current = null;
    setHasMore(true);
    hasMoreRef.current = true;
    setStreams([]);
    fetchStreams(false, true);
  }, [fetchStreams]);

  const languageOptions: LanguageOption[] = [
    { code: '', name: 'All Languages' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'zh', name: 'Chinese' },
  ];

  return {
    streams,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    filters,
    games,
    gamesLoading,
    languageOptions,
    loadInitial,
    loadMore,
    updateFilter,
    resetFilters,
  };
};