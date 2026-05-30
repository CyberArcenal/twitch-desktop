// src/renderer/pages/friends/index.tsx
import React from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { useFriends } from './hooks/useFriends';
import FriendCard from './components/FriendCard';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const FriendsPage: React.FC = () => {
  const { friends, loading, error, refresh, unfollow } = useFriends();

  if (loading) {
    return (
     <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load friends</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Friends</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {friends.length} {friends.length === 1 ? 'friend' : 'friends'} (mutual follows)
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Friend grid */}
      {friends.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
          <Users className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-lg font-medium text-[var(--sidebar-text)]">No mutual follows yet</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            When someone you follow follows you back, they'll appear here as a friend.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} onUnfollow={() => unfollow(friend.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;