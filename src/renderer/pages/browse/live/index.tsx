// src/renderer/pages/browse/live/index.tsx
import React, { useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useBrowseLive } from './hooks/useBrowseLive';
import LiveStreamCard from './components/LiveStreamCard';
import FilterBar from './components/FilterBar';
import Button from '../../../components/UI/Button';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const BrowseLivePage: React.FC = () => {
  const {
    streams,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    filters,
    games,
    gamesLoading,
    languageOptions,
    loadInitial,
    loadMore,
    updateFilter,
    resetFilters,
  } = useBrowseLive();

   // Call loadInitial only once when the component mounts
  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array – runs only on mount

  if (loading && streams.length === 0) {
    return (
          <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  if (error && streams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load live streams</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={loadInitial}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Live Channels</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {total} live streams • Watch now
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadInitial} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        games={games}
        gamesLoading={gamesLoading}
        languageOptions={languageOptions}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {/* Stream grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {streams.map((stream) => (
          <LiveStreamCard key={stream.id} stream={stream} />
        ))}
      </div>

      {/* Empty state */}
      {streams.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No live streams found with current filters.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Load More button */}
      {hasMore && streams.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="secondary"
            size="md"
            onClick={loadMore}
            disabled={loadingMore}
            icon={loadingMore ? Loader2 : undefined}
            iconPosition="left"
          >
            {loadingMore ? 'Loading...' : 'Load More Streams'}
          </Button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && streams.length > 0 && (
        <p className="text-center text-sm text-[var(--text-tertiary)] mt-8">
          You've reached the end of the list
        </p>
      )}
    </div>
  );
};

export default BrowseLivePage;