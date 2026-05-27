import { useState, useEffect, useCallback } from 'react';
import { notificationStoreAPI, type StoredNotification } from '../../../api/core/notification-store';
import { showSuccess, showError } from '../../../utils/notification';
import { dialogs } from '../../../utils/dialogs';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationStoreAPI.getAll();
      if (res.status) {
        setNotifications(res.data);
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
    fetchNotifications();

    // Listen for real-time new notifications
    const unsubNew = window.backendAPI?.on?.('notification:new', (notif: StoredNotification) => {
      setNotifications(prev => [notif, ...prev]);
    });
    const unsubUpdated = window.backendAPI?.on?.('notification:updated', (updated: StoredNotification) => {
      setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
    });
    const unsubDeleted = window.backendAPI?.on?.('notification:deleted', (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    });
    const unsubCleared = window.backendAPI?.on?.('notification:cleared', () => {
      setNotifications([]);
    });
    const unsubAllRead = window.backendAPI?.on?.('notification:all-read', () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    });

    return () => {
      unsubNew?.();
      unsubUpdated?.();
      unsubDeleted?.();
      unsubCleared?.();
      unsubAllRead?.();
    };
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    const res = await notificationStoreAPI.markRead(id);
    if (!res.status) showError(res.message);
  }, []);

  const markAllRead = useCallback(async () => {
    const res = await notificationStoreAPI.markAllRead();
    if (res.status) showSuccess('All notifications marked as read');
    else showError(res.message);
  }, []);

  const deleteOne = useCallback(async (id: string) => {
    const res = await notificationStoreAPI.delete(id);
    if (!res.status) showError(res.message);
  }, []);

  const clearAll = useCallback(async () => {
    const confirmed = await dialogs.confirm({
      title: 'Clear all notifications',
      message: 'Permanently delete all notifications?',
    });
    if (!confirmed) return;
    const res = await notificationStoreAPI.clearAll();
    if (res.status) showSuccess('All notifications cleared');
    else showError(res.message);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markRead,
    markAllRead,
    deleteOne,
    clearAll,
    refresh: fetchNotifications,
  };
};