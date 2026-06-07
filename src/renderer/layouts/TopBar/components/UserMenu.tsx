// src/layouts/components/UserMenu.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { userAPI, type TwitchUser } from '../../../api/core/user';
import { authAPI } from '../../../api/core/auth';
import { dialogs } from '../../../utils/dialogs';
import { hideLoading, showError, showLoading } from '../../../utils/notification';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      if (loggedIn.data) {
        const currentUser = await userAPI.getCurrentUser();
        if (currentUser.status && currentUser.data) {
          setUser(currentUser.data);
        }
      }
    };
    loadUser();

    const unsubscribe = window.backendAPI?.on?.('auth:changed', loadUser);
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (showMenu) {
          setAnimIn(false);
          setTimeout(() => setShowMenu(false), 150);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const toggleMenu = () => {
    if (!showMenu) {
      setShowMenu(true);
      setTimeout(() => setAnimIn(true), 10);
    } else {
      setAnimIn(false);
      setTimeout(() => setShowMenu(false), 150);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowMenu(false);
  };

  const handleLogout = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
    });
    if (!confirmed) return;
    try {
      showLoading('Removing Credentials...');
      await authAPI.logout();
      navigate('/login');
    } catch (err: any) {
      showError('Failed to logout.');
    } finally {
      hideLoading();
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--card-hover-bg)] transition-colors"
      >
        <img
          src={
            user.profile_image_url ||
            'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png'
          }
          alt={user.display_name}
          className="w-8 h-8 rounded-full border-2 border-[var(--primary-color)]"
        />
        <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] hidden sm:block" />
      </button>

      {showMenu && (
        <div
          className={`absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1 z-50 transition-all duration-150 ease-out origin-top-right
            ${animIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
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
  );
};

export default UserMenu;