// src/renderer/pages/dashboard/index.tsx
import React, { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { useDashboard } from "./hooks/useDashboard";
import DashboardWidget from "./components/DashboardWidget";
import LiveChannelCard from "./components/LiveChannelCard";
import RecommendationCard from "./components/RecommendationCard";
import RecentWatchedItem from "./components/RecentWatchedItem";
import StatsCard from "./components/StatsCard";
import QuickActions from "./components/QuickActions";
import Button from "../../components/UI/Button";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";

const DashboardPage: React.FC = () => {
  const {
    loading,
    error,
    liveChannels,
    recommendations,
    recentHistory,
    stats,
    refresh,
  } = useDashboard();

  const uniqueRecommendations = useMemo(() => {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      if (seen.has(rec.id)) return false;
      seen.add(rec.id);
      return true;
    });
  }, [recommendations]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <LoadingSpinner size="medium" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-red-500 mb-2 font-medium">Failed to load dashboard</p>
          <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          <Button variant="primary" size="sm" className="mt-6" onClick={refresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 mx-auto">
      {/* Header with greeting and refresh */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[var(--primary-color)] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Welcome back! Here's what's happening on Twitch.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          icon={RefreshCw}
          className="backdrop-blur-sm bg-[var(--card-bg)]/50 border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]"
        >
          Refresh
        </Button>
      </div>

      {/* Stats row - redesigned with glassmorphic cards */}
      <div className="mb-8">
        <StatsCard stats={stats} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <DashboardWidget title="Quick Actions" className="overflow-hidden">
          <QuickActions onGoLive={() => console.log("Go Live clicked")} />
        </DashboardWidget>
      </div>

      {/* Main grid - 3 columns with better spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Currently Live */}
        <DashboardWidget
          title="Currently Live"
          action={
            liveChannels.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {liveChannels.length} live now
              </span>
            )
          }
        >
          {liveChannels.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--card-secondary-bg)] flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                No followed channels are live right now.
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Check back later or browse live streams.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveChannels.map((channel) => (
                <LiveChannelCard key={channel.broadcaster_id} channel={channel} />
              ))}
              {liveChannels.length < stats.liveCount && (
                <p className="text-xs text-center text-[var(--text-tertiary)] pt-2">
                  +{stats.liveCount - liveChannels.length} more channels live
                </p>
              )}
            </div>
          )}
        </DashboardWidget>

        {/* Middle column: Recommendations */}
        <DashboardWidget title="Recommended for You">
          {uniqueRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--card-secondary-bg)] flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                No recommendations available.
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Start watching streams to get personalized suggestions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {uniqueRecommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </DashboardWidget>

        {/* Right column: Recently Watched */}
        <DashboardWidget title="Recently Watched">
          {recentHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--card-secondary-bg)] flex items-center justify-center">
                <span className="text-2xl">📺</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                No watch history yet.
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Streams you watch will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentHistory.map((entry) => (
                <RecentWatchedItem key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </DashboardWidget>
      </div>
    </div>
  );
};

export default DashboardPage;