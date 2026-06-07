// src/layouts/components/WhispersDropdown.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Conversation } from '../../../pages/whispers/types';
import { whisperAPI } from '../../../api/core/whisper';

interface WhispersDropdownProps {
  onUnreadCountChange?: (count: number) => void;
}

const WhispersDropdown: React.FC<WhispersDropdownProps> = ({ onUnreadCountChange }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadWhispers = async () => {
    const res = await whisperAPI.getConversations();
    if (res.status && res.data) {
      setConversations(res.data);
      const unread = res.data.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(unread);
      onUnreadCountChange?.(unread);
    }
  };

  useEffect(() => {
    loadWhispers();
    const unsubscribe = window.backendAPI?.on?.('whisper:new', loadWhispers);
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

  const openConversation = (userId: string, userName: string) => {
    navigate(`/whispers?user=${userId}&name=${userName}`);
    setShowDropdown(false);
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
        aria-label="Whispers"
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#9146ff] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className={`absolute right-0 mt-2 w-80 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-150 ease-out origin-top-right
            ${animIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)]">
            <h3 className="font-semibold text-[var(--sidebar-text)]">Whispers</h3>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-[var(--text-tertiary)]">No whisper conversations</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => openConversation(conv.userId, conv.userName)}
                  className="w-full text-left px-4 py-3 border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9146ff] to-[#772ce8] flex items-center justify-center text-white font-bold">
                    {conv.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-[var(--sidebar-text)] truncate">{conv.userName}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {formatRelativeTime(conv.lastTimestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{conv.lastMessage}</p>
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
                navigate('/whispers');
                setShowDropdown(false);
              }}
              className="text-xs text-[var(--primary-color)] hover:underline"
            >
              View all whispers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhispersDropdown;