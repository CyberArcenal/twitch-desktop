// src/renderer/pages/clips/hooks/useMyClips.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { clipsAPI, type Clip } from '../../../api/core/clips';
import { userAPI } from '../../../api/core/user';
import { showError, showSuccess } from '../../../utils/notification';

export const useMyClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchClips = useCallback(async (loadMore = false, after?: string | null) => {
    const userId = (await userAPI.getCurrentUser())?.data?.id;
    if (!userId) {
      setError('Not logged in');
      setLoading(false);
      return;
    }
    try {
      const res = await clipsAPI.getClips(userId, 30);
      if (res.status && res.data?.data) {
        const newClips = res.data.data;
        const newCursor = res.data.pagination?.cursor;
        if (loadMore && after) {
          setClips(prev => [...prev, ...newClips]);
        } else {
          setClips(newClips);
          setTotal(newClips.length);
        }
        setHasMore(!!newCursor);
        setCursor(newCursor || null);
      } else {
        throw new Error(res.message || 'Failed to fetch clips');
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadInitial = useCallback(() => {
    setLoading(true);
    fetchClips(false, null);
  }, [fetchClips]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    fetchClips(true, cursor);
  }, [hasMore, loadingMore, loading, cursor, fetchClips]);

  const deleteClip = useCallback(async (clipId: string) => {
    // Twitch API does not support clip deletion. Open external link to clip manager.
    const url = `https://dashboard.twitch.tv/u/${(await userAPI.getCurrentUser())?.data?.login}/content/clips`;
    window.open(url, '_blank');
    showSuccess('Opened clip manager in browser to delete');
  }, []);

  const copyLink = useCallback(async (clip: Clip) => {
    try {
      await navigator.clipboard.writeText(clip.url);
      showSuccess('Clip link copied to clipboard');
    } catch (err) {
      showError('Failed to copy link');
    }
  }, []);

  const shareClip = useCallback(async (clip: Clip) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.title,
          text: `Check out this clip from ${clip.creator_name}`,
          url: clip.url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') showError('Sharing failed');
      }
    } else {
      copyLink(clip);
    }
  }, [copyLink]);

  const filteredClips = useMemo(() => {
    if (!searchQuery.trim()) return clips;
    const q = searchQuery.toLowerCase();
    return clips.filter(c => c.title.toLowerCase().includes(q) || c.creator_name.toLowerCase().includes(q));
  }, [clips, searchQuery]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    clips: filteredClips,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadingMore,
    total,
    loadMore,
    refresh: loadInitial,
    deleteClip,
    copyLink,
    shareClip,
  };
};