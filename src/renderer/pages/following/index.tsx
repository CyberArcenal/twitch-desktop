// src/renderer/pages/following/index.tsx
import React from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { useFollowing } from './hooks/useFollowing';
import FilterBar from './components/FilterBar';
import EmptyState from './components/EmptyState';
import Button from '../../components/UI/Button';
import FollowingGrid from '../../components/Shared/FollowingGrid';

const FollowingPage: React.FC = () => {
  const {
    channels,
    loading,
    refreshing,
    error,
    filters,
    updateFilter,
    resetFilters,
    refresh,
  } = useFollowing();

  const liveCount = channels.filter((c) => c.isLive).length;

  return (
    <div className="p-4 md:p-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)] tracking-tight">
            Following
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {channels.length} channels followed • {liveCount} live now
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading || refreshing}
          icon={RefreshCw}
          iconPosition="left"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-[var(--card-secondary-bg)] rounded-xl">
          <p className="text-red-500 mb-2">Something went wrong</p>
          <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={refresh}>
            Try again
          </Button>
        </div>
      ) : channels.length === 0 ? (
        <EmptyState />
      ) : (
        <FollowingGrid channels={channels} />
      )}
    </div>
  );
};

export default FollowingPage;