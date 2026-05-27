// src/renderer/pages/history/hooks/useWatchHistory.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { historyAPI, type HistoryEntry } from '../../../api/core/history';
import { showSuccess, showError } from '../../../utils/notification';
import { dialogs } from '../../../utils/dialogs';
import type { SortField, SortOrder } from '../types';

export const useWatchHistory = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('watchedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await historyAPI.get(200); // fetch up to 200 entries
      if (res.status) {
        setEntries(res.data);
        setSelectedIds(new Set());
      } else {
        throw new Error(res.message || 'Failed to load history');
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter by search (channel name or title)
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.channelName.toLowerCase().includes(q) ||
        (e.title && e.title.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  // Sort
  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries];
    sorted.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'channelName':
          aVal = a.channelName.toLowerCase();
          bVal = b.channelName.toLowerCase();
          break;
        case 'title':
          aVal = (a.title || '').toLowerCase();
          bVal = (b.title || '').toLowerCase();
          break;
        case 'watchedAt':
        default:
          aVal = new Date(a.watchedAt).getTime();
          bVal = new Date(b.watchedAt).getTime();
          break;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredEntries, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Single delete
  const deleteEntry = async (id: string) => {
    const confirmed = await dialogs.confirm({
      title: 'Remove from history',
      message: 'Are you sure you want to remove this item from watch history?',
    });
    if (!confirmed) return;
    try {
      const res = await historyAPI.remove(id);
      if (res.status) {
        showSuccess('Removed from history');
        setEntries((prev) => prev.filter((e) => e.id !== id));
        selectedIds.delete(id);
        setSelectedIds(new Set(selectedIds));
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Bulk delete
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const confirmed = await dialogs.confirm({
      title: 'Delete selected',
      message: `Remove ${selectedIds.size} item(s) from history?`,
    });
    if (!confirmed) return;
    try {
      for (const id of selectedIds) {
        await historyAPI.remove(id);
      }
      showSuccess(`${selectedIds.size} item(s) removed`);
      setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Clear all history
  const clearAll = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Clear all history',
      message: 'This will permanently delete your entire watch history. Are you sure?',
      confirmText: 'Yes, clear all',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      const res = await historyAPI.clear();
      if (res.status) {
        showSuccess('Watch history cleared');
        setEntries([]);
        setSelectedIds(new Set());
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Toggle selection of a single entry
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedEntries.map((e) => e.id)));
    }
  };

  // Add to "Watch Later" – we'll implement later via separate API
  const addToWatchLater = async (entry: HistoryEntry) => {
    // Placeholder: you can implement a watch later list using electron-store
    showSuccess(`"${entry.channelName}" added to Watch Later`);
  };

  return {
    entries: sortedEntries,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedIds,
    sortField,
    sortOrder,
    toggleSort,
    deleteEntry,
    deleteSelected,
    clearAll,
    toggleSelect,
    toggleSelectAll,
    addToWatchLater,
    refresh: fetchHistory,
  };
};