// src/renderer/pages/my-clips/hooks/useMyClips.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { clipsAPI, type Clip } from '../../../api/core/clips';
import { userAPI } from '../../../api/core/user';
import { showError } from '../../../utils/notification';

const CLIPS_PER_PAGE = 24;

export const useMyClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [broadcasterId, setBroadcasterId] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  const fetchClips = useCallback(async (isLoadMore = false) => {
    if (loadingRef.current) return;
    if (isLoadMore && !hasMore) return;

    loadingRef.current = true;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Get current user if broadcasterId not known
      let broadcaster = broadcasterId;
      if (!broadcaster) {
        const userRes = await userAPI.getCurrentUser();
        if (!userRes.status || !userRes.data) {
          throw new Error('Not logged in');
        }
        broadcaster = userRes.data.id;
        setBroadcasterId(broadcaster);
      }

      const response = await clipsAPI.getClips(
        broadcaster,
        CLIPS_PER_PAGE,
        isLoadMore ? cursorRef.current || undefined : undefined
      );

      if (!response.status || !response.data?.data) {
        throw new Error(response.message || 'Failed to load clips');
      }

      const newClips = response.data.data;
      const newCursor = response.data.pagination?.cursor;

      if (!isLoadMore) {
        setClips(newClips);
        cursorRef.current = newCursor || null;
        setHasMore(!!newCursor && newClips.length === CLIPS_PER_PAGE);
        setTotal(newClips.length);
      } else {
        setClips(prev => [...prev, ...newClips]);
        cursorRef.current = newCursor || null;
        setHasMore(!!newCursor && newClips.length === CLIPS_PER_PAGE);
        setTotal(prev => prev + newClips.length);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load clips');
      showError(err.message);
    } finally {
      loadingRef.current = false;
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [broadcasterId, hasMore]);

  const loadInitial = useCallback(() => {
    cursorRef.current = null;
    setHasMore(true);
    setClips([]);
    fetchClips(false);
  }, [fetchClips]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchClips(true);
  }, [hasMore, loadingMore, loading, fetchClips]);

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    clips,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    refresh: loadInitial,
  };
};