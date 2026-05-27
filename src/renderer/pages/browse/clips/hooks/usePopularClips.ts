// src/renderer/pages/browse/clips/hooks/usePopularClips.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { clipsAPI, type Clip } from '../../../../api/core/clips';
import { showError } from '../../../../utils/notification';
import type { Period } from '../types';

const CLIPS_PER_PAGE = 30;

export const usePopularClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [period, setPeriod] = useState<Period>('week');
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  const fetchClips = useCallback(async (isLoadMore = false, resetPeriod = false) => {
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
      const response = await clipsAPI.getTopClips(
        undefined, // gameId
        period,
        CLIPS_PER_PAGE
      );
      if (!response.status || !response.data?.data) {
        throw new Error(response.message || 'Failed to fetch clips');
      }

      const newClips = response.data.data;
      const newCursor = response.data.pagination?.cursor;

      if (resetPeriod || !isLoadMore) {
        setClips(newClips);
        setTotal(newClips.length);
      } else {
        setClips(prev => [...prev, ...newClips]);
        setTotal(prev => prev + newClips.length);
      }
      cursorRef.current = newCursor || null;
      setHasMore(!!newCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load popular clips');
      showError(err.message);
    } finally {
      loadingRef.current = false;
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [period, hasMore, loadingMore]);

  const loadInitial = useCallback(() => {
    cursorRef.current = null;
    setHasMore(true);
    fetchClips(false, true);
  }, [fetchClips]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchClips(true, false);
  }, [hasMore, loadingMore, loading, fetchClips]);

  const changePeriod = useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
    cursorRef.current = null;
    setHasMore(true);
    fetchClips(false, true);
  }, [fetchClips]);

  const openClipModal = useCallback((clip: Clip) => {
    setSelectedClip(clip);
  }, []);

  const closeClipModal = useCallback(() => {
    setSelectedClip(null);
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    clips,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    period,
    selectedClip,
    loadInitial,
    loadMore,
    changePeriod,
    openClipModal,
    closeClipModal,
  };
};