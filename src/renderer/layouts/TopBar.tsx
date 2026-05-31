// src/layouts/TopBar.tsx – Twitch Desktop with smooth dropdown animations
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  MessageCircle,
  Check,
  Trash2,
} from "lucide-react";
import UpdateNotifier from "../components/Shared/UpdateNotifier";
import { authAPI } from "../api/core/auth";
import { userAPI, type TwitchUser } from "../api/core/user";
import SearchBar from "../components/Shared/SearchBar";
import { notificationStoreAPI, type StoredNotification } from "../api/core/notification-store";
import { whisperAPI, type Conversation } from "../api/core/whisper";
import { dialogs } from "../utils/dialogs";
import { hideLoading, showError, showLoading } from "../utils/notification";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWhispers, setShowWhispers] = useState(false);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadWhisperCount, setUnreadWhisperCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const whisperRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [animNotif, setAnimNotif] = useState(false);
  const [animWhisper, setAnimWhisper] = useState(false);
  const [animUserMenu, setAnimUserMenu] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      setIsLoggedIn(loggedIn.data);
      if (loggedIn.data) {
        const currentUser = await userAPI.getCurrentUser();
        if (currentUser.status && currentUser.data) {
          setUser(currentUser.data);
          loadNotifications();
          loadWhispers();
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    const unsubscribe = window.backendAPI?.on?.("auth:changed", checkAuth);
    const notifListener = window.backendAPI?.on?.("notification:new", () => loadNotifications());
    const whisperListener = window.backendAPI?.on?.("whisper:new", () => loadWhispers());
    return () => {
      unsubscribe?.();
      notifListener?.();
      whisperListener?.();
    };
  }, []);

  const loadNotifications = async () => {
    const res = await notificationStoreAPI.getAll();
    if (res.status && res.data) {
      setNotifications(res.data);
      setUnreadNotifCount(res.data.filter((n) => !n.read).length);
    }
  };

  const loadWhispers = async () => {
    const res = await whisperAPI.getConversations();
    if (res.status && res.data) {
      setConversations(res.data);
      const unread = res.data.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadWhisperCount(unread);
    }
  };

  const markNotificationRead = async (id: string) => {
    await notificationStoreAPI.markRead(id);
    await loadNotifications();
  };

  const markAllNotificationsRead = async () => {
    await notificationStoreAPI.markAllRead();
    await loadNotifications();
  };

  const deleteNotification = async (id: string) => {
    await notificationStoreAPI.delete(id);
    await loadNotifications();
  };

  const clearAllNotifications = async () => {
    if (await dialogs.confirm({ title: "Clear All", message: "Delete all notifications?" })) {
      await notificationStoreAPI.clearAll();
      await loadNotifications();
    }
  };

  const openWhisperConversation = (userId: string, userName: string) => {
    navigate(`/whispers?user=${userId}&name=${userName}`);
    setShowWhispers(false);
  };

  const handleLogin = async () => {
    if (
      !(await dialogs.confirm({
        title: "Login Required",
        message: "You need to log in with Twitch to access this feature. Do you want to log in now?",
      }))
    )
      return;
    navigate("/login");
  };

  const handleLogout = async () => {
    if (
      !(await dialogs.confirm({
        title: "Confirm Logout",
        message: "Are you sure you want to logout?",
      }))
    ) {
      return;
    }
    try {
      showLoading(`Removing Credentials...`);
      await authAPI.logout();
      setIsLoggedIn(false);
      setUser(null);
      navigate("/login");
    } catch (err: any) {
      showError("Failed To Logout.");
    } finally {
      hideLoading();
    }
  };

  const handleSettings = () => {
    navigate("/settings");
    setShowUserMenu(false);
  };

  // Toggle dropdowns with animation
  const toggleNotifications = () => {
    if (!showNotifications) {
      setShowNotifications(true);
      setTimeout(() => setAnimNotif(true), 10);
    } else {
      setAnimNotif(false);
      setTimeout(() => setShowNotifications(false), 150);
    }
    setShowWhispers(false);
    setShowUserMenu(false);
  };

  const toggleWhispers = () => {
    if (!showWhispers) {
      setShowWhispers(true);
      setTimeout(() => setAnimWhisper(true), 10);
    } else {
      setAnimWhisper(false);
      setTimeout(() => setShowWhispers(false), 150);
    }
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    if (!showUserMenu) {
      setShowUserMenu(true);
      setTimeout(() => setAnimUserMenu(true), 10);
    } else {
      setAnimUserMenu(false);
      setTimeout(() => setShowUserMenu(false), 150);
    }
    setShowNotifications(false);
    setShowWhispers(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        if (showNotifications) {
          setAnimNotif(false);
          setTimeout(() => setShowNotifications(false), 150);
        }
      }
      if (whisperRef.current && !whisperRef.current.contains(event.target as Node)) {
        if (showWhispers) {
          setAnimWhisper(false);
          setTimeout(() => setShowWhispers(false), 150);
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        if (showUserMenu) {
          setAnimUserMenu(false);
          setTimeout(() => setShowUserMenu(false), 150);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, showWhispers, showUserMenu]);

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] flex items-center justify-between px-4 py-2 shadow-lg rounded-2xl mx-2 mt-2 backdrop-blur-sm bg-opacity-95">
      {/* Left – Menu + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-lg font-bold bg-gradient-to-r from-[#9146ff] to-[#772ce8] bg-clip-text text-transparent hidden sm:inline">
            Twitch Desktop
          </span>
        </div>
      </div>

      {/* Center – Search */}
      <div className="flex-1 max-w-xl mx-4">
        <SearchBar />
      </div>

      {/* Right – Actions & User */}
      <div className="flex items-center gap-2">
        <UpdateNotifier />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={toggleNotifications}
            className="relative p-2 rounded-xl hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-96 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-150 ease-out origin-top-right
                ${animNotif ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)]">
                <h3 className="font-semibold text-[var(--sidebar-text)]">Notifications</h3>
                <div className="flex gap-2">
                  {notifications.some((n) => !n.read) && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-[var(--primary-color)] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors ${
                        !notif.read ? "bg-[var(--primary-color)]/5" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--sidebar-text)]">
                            {notif.title}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {notif.message}
                          </p>
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
                    navigate("/notifications");
                    setShowNotifications(false);
                  }}
                  className="text-xs text-[var(--primary-color)] hover:underline"
                >
                  View all in Notifications page
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Whisper Button & Dropdown */}
        <div className="relative" ref={whisperRef}>
          <button
            onClick={toggleWhispers}
            className="relative p-2 rounded-xl hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadWhisperCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#9146ff] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {unreadWhisperCount > 9 ? "9+" : unreadWhisperCount}
              </span>
            )}
          </button>

          {showWhispers && (
            <div
              className={`absolute right-0 mt-2 w-80 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-150 ease-out origin-top-right
                ${animWhisper ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)]">
                <h3 className="font-semibold text-[var(--sidebar-text)]">Whispers</h3>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                    No whisper conversations
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => openWhisperConversation(conv.userId, conv.userName)}
                      className="w-full text-left px-4 py-3 border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9146ff] to-[#772ce8] flex items-center justify-center text-white font-bold">
                        {conv.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <span className="font-medium text-[var(--sidebar-text)] truncate">
                            {conv.userName}
                          </span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {formatRelativeTime(conv.lastTimestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#9146ff] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-[var(--border-color)] text-center">
                <button
                  onClick={() => {
                    navigate("/whispers");
                    setShowWhispers(false);
                  }}
                  className="text-xs text-[var(--primary-color)] hover:underline"
                >
                  View all whispers
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        {isLoggedIn && user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <img
                src={
                  user.profile_image_url ||
                  "https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png"
                }
                alt={user.display_name}
                className="w-8 h-8 rounded-full border-2 border-[var(--primary-color)]"
              />
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] hidden sm:block" />
            </button>

            {showUserMenu && (
              <div
                className={`absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1 z-50 transition-all duration-150 ease-out origin-top-right
                  ${animUserMenu ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              >
                <div className="px-4 py-2 border-b border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--sidebar-text)]">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">@{user.login}</p>
                </div>
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-[var(--card-hover-bg)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9146ff] to-[#772ce8] hover:opacity-90 text-white text-sm font-medium transition-all duration-200 shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Login with Twitch</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;