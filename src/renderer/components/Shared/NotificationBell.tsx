// src/components/Twitch/NotificationBell.tsx
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import NotificationDrawer from "./NotificationDrawer"; // new component below

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // For demo, we can listen to eventsub notifications and count them
  // In a real app, you'd have a store for unread notifications.
  useEffect(() => {
    const handleStreamLive = () => {
      setUnreadCount((prev) => prev + 1);
    };
    const handleFollow = () => {
      setUnreadCount((prev) => prev + 1);
    };
    window.backendAPI?.on?.("eventsub:stream-online", handleStreamLive);
    window.backendAPI?.on?.("eventsub:follow", handleFollow);
    return () => {
      window.backendAPI?.off?.("eventsub:stream-online", handleStreamLive);
      window.backendAPI?.off?.("eventsub:follow", handleFollow);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="relative p-2 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--primary-color)] text-white text-xs font-bold rounded-full px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onRead={() => setUnreadCount(0)} />
    </>
  );
};

export default NotificationBell;