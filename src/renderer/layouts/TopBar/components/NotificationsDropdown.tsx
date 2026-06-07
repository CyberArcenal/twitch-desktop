// src/layouts/components/NotificationsDropdown.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationStoreAPI, type StoredNotification } from '../../../api/core/notification-store';
import { dialogs } from '../../../utils/dialogs';


interface NotificationsDropdownProps {
  onNotificationCountChange?: (count: number) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onNotificationCountChange }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const res = await notificationStoreAPI.getAll();
    if (res.status && res.data) {
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
      onNotificationCountChange?.(unread);
    }
  };

  useEffect(() => {
    loadNotifications();
    const unsubscribe = window.backendAPI?.on?.('notification:new', loadNotifications);
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (showDropdown) {
          setAnimIn(false);
          setTimeout(() => setShowDropdown(false), 150);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const toggleDropdown = () => {
    if (!showDropdown) {
      setShowDropdown(true);
      setTimeout(() => setAnimIn(true), 10);
    } else {
      setAnimIn(false);
      setTimeout(() => setShowDropdown(false), 150);
    }
  };

  const markNotificationRead = async (id: string) => {
    await notificationStoreAPI.markRead(id);
    await loadNotifications();
  };

  const markAllRead = async () => {
    await notificationStoreAPI.markAllRead();
    await loadNotifications();
  };

  const deleteNotification = async (id: string) => {
    await notificationStoreAPI.delete(id);
    await loadNotifications();
  };

  const clearAll = async () => {
    if (await dialogs.confirm({ title: 'Clear All', message: 'Delete all notifications?' })) {
      await notificationStoreAPI.clearAll();
      await loadNotifications();
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className={`absolute right-0 mt-2 w-96 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-150 ease-out origin-top-right
            ${animIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)]">
            <h3 className="font-semibold text-[var(--sidebar-text)]">Notifications</h3>
            <div className="flex gap-2">
              {notifications.some((n) => !n.read) && (
                <button onClick={markAllRead} className="text-xs text-[var(--primary-color)] hover:underline">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-red-400 hover:underline">
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[var(--text-tertiary)]">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors ${
                    !notif.read ? 'bg-[var(--primary-color)]/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--sidebar-text)]">{notif.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{notif.message}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        {formatRelativeTime(notif.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="p-1 rounded-md hover:bg-[var(--primary-color)]/20 text-[var(--primary-color)]"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 rounded-md hover:bg-red-500/20 text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-[var(--border-color)] text-center">
            <button
              onClick={() => {
                navigate('/notifications');
                setShowDropdown(false);
              }}
              className="text-xs text-[var(--primary-color)] hover:underline"
            >
              View all in Notifications page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;