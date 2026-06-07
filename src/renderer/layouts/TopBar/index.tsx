// src/layouts/TopBar.tsx
import React from 'react';
import TopBarLeft from './components/TopBarLeft';
import NotificationsDropdown from './components/NotificationsDropdown';
import WhispersDropdown from './components/WhispersDropdown';
import UserMenu from './components/UserMenu';
import LoginButton from './components/LoginButton';
import FollowingAvatars from './components/FollowingAvatars';
import { useState, useEffect } from 'react';
import { authAPI } from '../../api/core/auth';
import SearchBar from '../../components/Shared/SearchBar';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      setIsLoggedIn(loggedIn.data);
    };
    checkAuth();
    const unsubscribe = window.backendAPI?.on?.('auth:changed', checkAuth);
    return () => unsubscribe?.();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] flex items-center justify-between px-4 py-2 shadow-lg rounded-2xl mx-2 mt-2 backdrop-blur-sm bg-opacity-95">
      <TopBarLeft toggleSidebar={toggleSidebar} />

      <div className="flex-1 max-w-xl mx-4">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        {/* Show following avatars only in fullscreen and logged in */}
        {isLoggedIn && <FollowingAvatars />}
        
        <NotificationsDropdown />
        <WhispersDropdown />
        {isLoggedIn ? <UserMenu /> : <LoginButton />}
      </div>
    </header>
  );
};

export default TopBar;