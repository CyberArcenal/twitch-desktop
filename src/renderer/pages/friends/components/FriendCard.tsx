// src/renderer/pages/friends/components/FriendCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, UserMinus, Tv, Eye, MoreVertical } from 'lucide-react';
import type { MutualFriend } from '../types';

interface FriendCardProps {
  friend: MutualFriend;
  onUnfollow: () => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, onUnfollow }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleViewChannel = () => {
    navigate(`/channel/${friend.login}`);
  };

  const handleMessage = () => {
    // Open whisper with this user (will navigate to whispers page with pre-filled recipient)
    navigate(`/whispers?user=${friend.login}`);
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--primary-color)] transition-all relative">
      <div className="flex items-start gap-3">
        {/* Avatar with online indicator */}
        <div className="relative">
          <img
            src={friend.profile_image_url}
            alt={friend.display_name}
            className="w-12 h-12 rounded-full border-2 border-[var(--border-color)]"
          />
          {friend.isLive && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-[var(--card-bg)]"></span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--sidebar-text)] truncate">
              {friend.display_name}
            </h3>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)]"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">@{friend.login}</p>
          {friend.isLive ? (
            <div className="mt-2">
              <p className="text-sm text-[var(--sidebar-text)] truncate">{friend.liveTitle}</p>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="flex items-center gap-1 text-red-500">
                  <Tv className="w-3 h-3" /> LIVE
                </span>
                <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                  <Eye className="w-3 h-3" /> {friend.viewerCount?.toLocaleString()}
                </span>
                <span className="text-[var(--text-secondary)]">{friend.liveGame}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)] mt-2">Offline</p>
          )}
        </div>
      </div>

      {/* Floating context menu */}
      {showMenu && (
        <div className="absolute right-4 top-16 z-10 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1">
          <button
            onClick={() => { handleViewChannel(); setShowMenu(false); }}
            className="w-full px-4 py-2 text-left text-sm text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)] flex items-center gap-2"
          >
            <Tv className="w-4 h-4" /> View Channel
          </button>
          <button
            onClick={() => { handleMessage(); setShowMenu(false); }}
            className="w-full px-4 py-2 text-left text-sm text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)] flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Message
          </button>
          <hr className="my-1 border-[var(--border-color)]" />
          <button
            onClick={() => { onUnfollow(); setShowMenu(false); }}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[var(--card-hover-bg)] flex items-center gap-2"
          >
            <UserMinus className="w-4 h-4" /> Unfollow
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendCard;