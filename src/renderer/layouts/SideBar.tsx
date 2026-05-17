// src/layouts/SideBar.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Settings,
  LogOut,
  Twitch,
  MessageCircle,
  Search,
  Heart,
  User,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Radio,
} from "lucide-react";
import authAPI from "../api/core/auth";
import settingsAPI from "../api/core/settings";
import { dialogs } from "../utils/dialogs";

interface SidebarProps {
  isOpen: boolean;
  onGoLive: () => void;
}

interface MenuItem {
  path: string;
  name: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onGoLive }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );
  useEffect(() => {
    const loadUser = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      if (loggedIn) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    if (!await dialogs.confirm({ title: "Confirm Logout", message: "Are you sure you want to logout?"})) return;
    await authAPI.logout();
    navigate("/login");
  };

  const menuItems: MenuItem[] = [
    { path: "/", name: "Following", icon: Home },
    { path: "/browse", name: "Browse", icon: Search },
    { path: "/chat", name: "Chat", icon: MessageCircle },
    { path: "/followers", name: "Followers", icon: Heart },
    { path: "/profile", name: "Profile", icon: User },
    {
      path: "/settings",
      name: "Settings",
      icon: Settings,
      children: [
        { path: "/settings/appearance", name: "Appearance", icon: Settings },
        {
          path: "/settings/chat-filters",
          name: "Chat Filters",
          icon: MessageCircle,
        },
        { path: "/settings/notifications", name: "Notifications", icon: Bell },
      ],
    },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActivePath = (path: string) => location.pathname === path;
  const isDropdownActive = (items: MenuItem[] = []) =>
    items.some((item) => isActivePath(item.path));

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children && isDropdownActive(item.children)) {
        setOpenDropdowns((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const hasChildren = !!item.children?.length;
      const isActive = hasChildren
        ? isDropdownActive(item.children)
        : isActivePath(item.path);
      const isOpen = openDropdowns[item.name];

      return (
        <li key={item.path} className="mb-1">
          {hasChildren ? (
            <>
              <button
                onClick={() => toggleDropdown(item.name)}
                className={`w-full group flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-[var(--twitch-purple)] text-white shadow-md"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <ul className="ml-4 mt-1 space-y-1 border-l-2 pl-3 border-[var(--twitch-purple)]">
                  {item.children!.map((child) => (
                    <li key={child.path}>
                      <Link
                        to={child.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                          ${
                            isActivePath(child.path)
                              ? "text-[var(--twitch-purple)] bg-[var(--twitch-purple-bg)] font-semibold"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white"
                          }`}
                      >
                        <child.icon className="w-4 h-4" />
                        <span>{child.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <Link
              to={item.path}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? "bg-[var(--twitch-purple)] text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
            </Link>
          )}
        </li>
      );
    });
  };

  // Collapsed sidebar (width 16)
  if (!isOpen) {
    return (
      <div className="fixed md:relative flex flex-col h-screen md:h-full w-16 bg-[var(--bg-elevated)] border-r border-[var(--border-default)]">
        {/* Logo */}
        <div className="flex justify-center py-4 border-b border-[var(--border-default)]">
          <Twitch className="w-8 h-8 text-[var(--twitch-purple)]" />
        </div>

        {/* Navigation - scrollable */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex justify-center py-3 mb-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors"
              title={item.name}
            >
              <item.icon className="w-5 h-5 text-[var(--text-secondary)]" />
            </Link>
          ))}
        </div>

        {/* Footer - always at bottom */}
        <div className="flex-shrink-0 border-t border-[var(--border-default)] px-2 py-3">
          <button
            onClick={() => navigate("/help")}
            className="flex justify-center py-3 w-full rounded-lg hover:bg-[var(--bg-overlay)] transition-colors mb-1"
            title="Help"
          >
            <HelpCircle className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={handleLogout}
            className="flex justify-center py-3 w-full rounded-lg hover:bg-[var(--bg-overlay)] transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded sidebar (width 64)
  return (
    <div className="fixed md:relative flex flex-col h-screen md:h-full w-64 bg-[var(--bg-elevated)] border-r border-[var(--border-default)] shadow-xl">
      {/* Header - fixed */}
      <div className="border-b border-[var(--border-default)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--twitch-purple)] flex items-center justify-center">
            <Twitch className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">
              Twitch Desktop
            </h2>
            {user && (
              <p className="text-xs text-[var(--text-tertiary)]">
                @{user.login}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation - scrollable middle */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">{renderMenuItems(menuItems)}</ul>
      </div>

      {/* Footer - fixed at bottom */}
      <div className="flex-shrink-0 border-t border-[var(--border-default)] px-2 py-3">
        <button
          onClick={onGoLive}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white"
        >
          <Radio className="w-5 h-5" />
          <span className="font-medium">Go Live</span>
        </button>
        <button
          onClick={() => navigate("/help")}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white transition-all duration-200 mb-1"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Help</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      
    </div>
  );
};

export default Sidebar;
