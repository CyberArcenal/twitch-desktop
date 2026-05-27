import React from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { useNotifications } from './hooks/useNotifications';
import NotificationItem from './components/NotificationItem';
import EmptyState from './components/EmptyState';
import Button from '../../components/UI/Button';

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markRead,
    markAllRead,
    deleteOne,
    clearAll,
    refresh,
  } = useNotifications();

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]" />
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load notifications</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={refresh}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <Button variant="secondary" size="sm" onClick={markAllRead} icon={CheckCheck}>
                Mark all read
              </Button>
              <Button variant="danger" size="sm" onClick={clearAll} icon={Trash2}>
                Clear all
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={() => markRead(notif.id)}
              onDelete={() => deleteOne(notif.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;