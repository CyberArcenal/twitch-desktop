// src/renderer/pages/watch-later/hooks/useWatchLater.ts
import { useState, useEffect, useCallback } from 'react';
import { watchLaterAPI, type WatchLaterItem } from '../../../api/core/watch-later';
import { historyAPI } from '../../../api/core/history';
import { showSuccess, showError } from '../../../utils/notification';
import { dialogs } from '../../../utils/dialogs';

export const useWatchLater = () => {
  const [items, setItems] = useState<WatchLaterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await watchLaterAPI.getAll();
      if (res.status) {
        setItems(res.data);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (item: Omit<WatchLaterItem, 'addedAt'>) => {
    const res = await watchLaterAPI.add(item);
    if (res.status) {
      showSuccess(`Added "${item.title}" to Watch Later`);
      fetchItems();
      return true;
    } else {
      showError(res.message);
      return false;
    }
  }, [fetchItems]);

  const removeItem = useCallback(async (id: string) => {
    const res = await watchLaterAPI.remove(id);
    if (res.status) {
      showSuccess('Removed from Watch Later');
      setItems(prev => prev.filter(i => i.id !== id));
      return true;
    } else {
      showError(res.message);
      return false;
    }
  }, []);

  const clearAll = useCallback(async () => {
    const confirmed = await dialogs.confirm({
      title: 'Clear Watch Later',
      message: 'Remove all items from Watch Later?',
    });
    if (!confirmed) return;
    const res = await watchLaterAPI.clear();
    if (res.status) {
      showSuccess('Watch Later cleared');
      setItems([]);
    } else {
      showError(res.message);
    }
  }, []);

  const markAsWatched = useCallback(async (id: string) => {
    const res = await watchLaterAPI.markAsWatched(id);
    if (res.status && res.data) {
      const item = res.data;
      await historyAPI.add({
        type: item.type === 'vod' ? 'vod' : 'stream',
        channelName: item.channelName,
        vodId: item.type === 'vod' ? item.id.replace('vod_', '') : null,
        title: item.title,
        thumbnail: item.thumbnail,
        watchedAt: new Date().toDateString(),
        duration: null,
      });
      showSuccess(`"${item.title}" marked as watched and moved to history`);
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      showError(res.message);
    }
  }, []);

  const reorderItems = useCallback(async (newOrder: WatchLaterItem[]) => {
    const res = await watchLaterAPI.reorder(newOrder);
    if (res.status) {
      setItems(newOrder);
    } else {
      showError('Failed to reorder');
    }
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
    removeItem,
    clearAll,
    markAsWatched,
    reorderItems,
    refresh: fetchItems,
  };
};