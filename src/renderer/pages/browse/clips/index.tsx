// src/renderer/pages/browse/clips/index.tsx
import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { usePopularClips } from './hooks/usePopularClips';
import ClipCard from './components/ClipCard';
import PeriodSelector from './components/PeriodSelector';
import ClipModal from './components/ClipModal';
import Button from '../../../components/UI/Button';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const PopularClipsPage: React.FC = () => {
  const {
    clips,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    period,
    selectedClip,
    loadInitial,
    loadMore,
    changePeriod,
    openClipModal,
    closeClipModal,
  } = usePopularClips();

  if (loading && clips.length === 0) {
    return (
     <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  if (error && clips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load popular clips</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={loadInitial}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Popular Clips</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {total} clips • Most viewed this {period}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector period={period} onChange={changePeriod} />
            <Button variant="ghost" size="sm" onClick={loadInitial} icon={RefreshCw} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Clip grid – responsive masonry-like grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} onClick={openClipModal} />
          ))}
        </div>

        {/* Empty state */}
        {clips.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">No clips found for this period.</p>
          </div>
        )}

        {/* Load More button */}
        {hasMore && clips.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="secondary"
              size="md"
              onClick={loadMore}
              disabled={loadingMore}
              icon={loadingMore ? Loader2 : undefined}
              iconPosition="left"
            >
              {loadingMore ? 'Loading...' : 'Load More Clips'}
            </Button>
          </div>
        )}

        {/* End of list */}
        {!hasMore && clips.length > 0 && (
          <p className="text-center text-sm text-[var(--text-tertiary)] mt-8">
            You've reached the end of the list
          </p>
        )}
      </div>

      {/* Clip Modal */}
      <ClipModal clip={selectedClip} onClose={closeClipModal} />
    </>
  );
};

export default PopularClipsPage;