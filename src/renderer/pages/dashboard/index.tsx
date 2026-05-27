// src/renderer/pages/dashboard/index.tsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';
import DashboardWidget from './components/DashboardWidget';
import LiveChannelCard from './components/LiveChannelCard';
import RecommendationCard from './components/RecommendationCard';
import RecentWatchedItem from './components/RecentWatchedItem';
import StatsCard from './components/StatsCard';
import QuickActions from './components/QuickActions';
import Button from '../../components/UI/Button';

const DashboardPage: React.FC = () => {
  const { loading, error, liveChannels, recommendations, recentHistory, stats, refresh } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load dashboard</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 mx-auto m-1">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Dashboard</h1>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="mb-6">
        <StatsCard stats={stats} />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <DashboardWidget title="Quick Actions">
          <QuickActions onGoLive={() => console.log('Go Live clicked')} />
        </DashboardWidget>
      </div>

      {/* Main grid: 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Currently Live */}
        <DashboardWidget title="Currently Live" action={liveChannels.length > 0 && <span className="text-xs text-red-500">{liveChannels.length} live</span>}>
          {liveChannels.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-4">No followed channels are live right now.</p>
          ) : (
            <div className="space-y-2">
              {liveChannels.map(channel => (
                <LiveChannelCard key={channel.broadcaster_id} channel={channel} />
              ))}
              {liveChannels.length < stats.liveCount && (
                <p className="text-xs text-center text-[var(--text-tertiary)] mt-2">+{stats.liveCount - liveChannels.length} more live</p>
              )}
            </div>
          )}
        </DashboardWidget>

        {/* Middle column: Recommendations */}
        <DashboardWidget title="Recommended for You">
          {recommendations.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-4">No recommendations available.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </DashboardWidget>

        {/* Right column: Recently Watched */}
        <DashboardWidget title="Recently Watched">
          {recentHistory.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-4">No watch history yet.</p>
          ) : (
            <div className="space-y-2">
              {recentHistory.map(entry => (
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