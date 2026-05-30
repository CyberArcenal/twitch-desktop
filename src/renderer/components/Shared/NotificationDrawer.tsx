// src/components/Twitch/NotificationDrawer.tsx
import React, { useState, useEffect } from "react";
import { X, Bell, CheckCheck, Trash2, Loader2, UserPlus, Tv, Star, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

  const getIcon = (type: string) => {
    switch (type) {
      case "stream_online": return <Tv className="w-5 h-5 text-red-400" />;
      case "follow": return <UserPlus className="w-5 h-5 text-green-400" />;
      case "subscription": return <Star className="w-5 h-5 text-purple-400" />;
      default: return <Bell className="w-5 h-5 text-[#adadb8]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#1f1f2b] to-[#18181b] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2e] bg-[#1f1f23]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-[#9147ff]/10">
              <Bell className="w-5 h-5 text-[#9147ff]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#2a2a2e] transition-colors"
          >
            <X className="w-5 h-5 text-[#adadb8]" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="flex justify-end p-3 border-b border-[#2a2a2e] bg-[#1f1f23]/30">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#9147ff] hover:bg-[#9147ff]/10 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#9147ff] animate-spin" />
              <p className="text-sm text-[#adadb8] mt-3">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-[#0e0e10] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#adadb8]" />
              </div>
              <h3 className="text-lg font-semibold text-white">All caught up</h3>
              <p className="text-sm text-[#adadb8] mt-1 max-w-xs">
                When someone follows or goes live, you'll see it here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`group relative p-4 rounded-xl transition-all duration-200 ${
                  !notif.read
                    ? "bg-gradient-to-r from-[#9147ff]/10 to-transparent border-l-4 border-l-[#9147ff]"
                    : "bg-[#0e0e10] border border-[#2a2a2e] hover:border-[#9147ff]/30"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{notif.title}</p>
                    <p className="text-sm text-[#adadb8] mt-1">{notif.message}</p>
                    <p className="text-xs text-[#adadb8]/60 mt-2">
                      {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-[#2a2a2e] transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4 text-[#9147ff]" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-[#2a2a2e] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
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