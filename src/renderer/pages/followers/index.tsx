// src/pages/Following/index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../../api/core/auth";
import { useFollowedChannels } from "./hooks/useFollowedChannels";
import { ChannelCard } from "./components/ChannelCard";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";
import { LoadMoreButton } from "./components/LoadMoreButton";

const FollowingPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Get current user ID
  useEffect(() => {
    const initAuth = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
        return;
      }
      const user = await authAPI.getCurrentUser();
      if (user?.id) {
        setUserId(user.id);
      } else {
        // No user info – redirect or show error
        navigate("/login");
      }
      setAuthLoading(false);
    };
    initAuth();
  }, [navigate]);

  const {
    channels,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry,
  } = useFollowedChannels(userId);

  if (authLoading || loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  if (channels.length === 0) {
    return <EmptyState />;
  }

  const liveChannels = channels.filter((ch) => ch.isLive);
  const offlineChannels = channels.filter((ch) => !ch.isLive);

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Following
          </h1>
          <span className="text-sm text-[var(--text-secondary)]">
            {channels.length} channels
          </span>
        </div>

        {/* Live section */}
        {liveChannels.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--accent-live)] rounded-full animate-pulse"></span>
              Live Now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liveChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onClick={() => navigate(`/stream/${channel.login}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Offline section */}
        {offlineChannels.length > 0 && (
          <div className="pb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Offline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {offlineChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onClick={() => navigate(`/stream/${channel.login}`)}
                />
              ))}
            </div>
          </div>
        )}

        {hasMore && <LoadMoreButton loading={loadingMore} onClick={loadMore} />}
      </div>
    </div>
  );
};

export default FollowingPage;