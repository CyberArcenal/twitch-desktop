// src/layouts/TopBar.tsx – Twitch Desktop
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogIn, LogOut, User, Settings, ChevronDown } from "lucide-react";
import UpdateNotifier from "../components/Shared/UpdateNotifier";
import { authAPI } from "../api/core/auth";
import { userAPI, type TwitchUser } from "../api/core/user";
import SearchBar from "../components/Shared/SearchBar";
import NotificationBell from "../components/Shared/NotificationBell";

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      setIsLoggedIn(loggedIn.data);
      if (loggedIn.data) {
        const currentUser = await userAPI.getCurrentUser();
        if (currentUser.status && currentUser.data) {
          setUser(currentUser.data);
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    // Listen for auth changes (e.g., after login/logout)
    const unsubscribe = window.backendAPI?.on?.("auth:changed", checkAuth);
    return () => unsubscribe?.();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/settings");
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] flex items-center justify-between px-4 py-2 shadow-sm">
      {/* Left – Menu + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          {/* <img src="./icon.png" alt="Twitch Desktop" className="w-8 h-8 rounded-lg" /> */}
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
        {/* <ThemeToggle /> */}
        <UpdateNotifier />
        <NotificationBell />

        {isLoggedIn && user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <img
                src={user.profile_image_url || "https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png"}
                alt={user.display_name}
                className="w-8 h-8 rounded-full border-2 border-[var(--primary-color)]"
              />
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 z-50">
                <div className="px-4 py-2 border-b border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--sidebar-text)]">{user.display_name}</p>
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-all duration-200 shadow-md"
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