// src/components/Twitch/NotificationDrawer.tsx
import React, { useState, useEffect } from "react";
import { X, Bell, CheckCheck, Trash2, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "stream_online" | "follow" | "subscription";
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRead: () => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onRead }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    // In a real app, you'd fetch from a local store or IPC
    // For demo, we'll listen to events and collect them
    const handleStreamLive = (event: any, data: any) => {
      setNotifications((prev) => [
        {
          id: `stream_${Date.now()}`,
          title: `${data.broadcasterName} went live!`,
          message: data.title,
          type: "stream_online",
          timestamp: new Date(),
          read: false,
          data,
        },
        ...prev,
      ]);
    };
    const handleFollow = (event: any, data: any) => {
      setNotifications((prev) => [
        {
          id: `follow_${Date.now()}`,
          title: "New follower",
          message: `${data.followerName} followed you!`,
          type: "follow",
          timestamp: new Date(),
          read: false,
          data,
        },
        ...prev,
      ]);
    };
    window.backendAPI?.on?.("eventsub:stream-online", handleStreamLive);
    window.backendAPI?.on?.("eventsub:follow", handleFollow);
    setLoading(false);
    return () => {
      window.backendAPI?.off?.("eventsub:stream-online", handleStreamLive);
      window.backendAPI?.off?.("eventsub:follow", handleFollow);
    };
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const stillUnread = notifications.some((n) => !n.read && n.id !== id);
    if (!stillUnread) onRead();
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onRead();
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const stillUnread = notifications.some((n) => !n.read && n.id !== id);
    if (!stillUnread) onRead();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-color)] shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">Notifications</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--card-hover-bg)] rounded">
            <X className="w-5 h-5 text-[var(--text-tertiary)]" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex justify-end p-2 border-b border-[var(--border-color)]">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded"
            >
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)]" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-10 h-10 mx-auto mb-2 text-[var(--text-tertiary)]" />
              <p className="text-[var(--sidebar-text)]">No notifications yet</p>
              <p className="text-xs text-[var(--text-tertiary)]">When someone follows or goes live, you'll see it here.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg transition-all ${!notif.read ? "bg-[var(--primary-color)]/10 border-l-4 border-l-[var(--primary-color)]" : "bg-[var(--card-secondary-bg)]"}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[var(--sidebar-text)]">{notif.title}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{notif.message}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">{format(notif.timestamp, "MMM dd, hh:mm a")}</p>
                  </div>
                  <div className="flex gap-1">
                    {!notif.read && (
                      <button onClick={() => markAsRead(notif.id)} className="p-1 hover:bg-[var(--card-hover-bg)] rounded" title="Mark read">
                        <CheckCheck className="w-4 h-4 text-[var(--primary-color)]" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notif.id)} className="p-1 hover:bg-[var(--card-hover-bg)] rounded" title="Delete">
                      <Trash2 className="w-4 h-4 text-[var(--danger-color)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;