// src/renderer/pages/my-clips/index.tsx
import React, { useState } from 'react';
import { RefreshCw, Video, Loader2 } from 'lucide-react';
import { useMyClips } from './hooks/useMyClips';
import ClipCard from '../browse/clips/components/ClipCard';
import ClipModal from '../browse/clips/components/ClipModal';
import type { Clip } from '../../api/core/clips';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const MyClipsPage: React.FC = () => {
  const { clips, loading, loadingMore, error, hasMore, total, refresh, loadMore } = useMyClips();
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  if (loading && clips.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="medium" text="Loading your clips..." />
      </div>
    );
  }

  if (error && clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-500 mb-2">Failed to load clips</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">My Clips</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {total} clip{total !== 1 ? 's' : ''} • Created from your channel
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          icon={RefreshCw}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Empty state */}
      {clips.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--card-hover-bg)] flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--sidebar-text)] mb-1">No clips yet</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            You haven't created any clips from your channel. Start creating clips during your streams!
          </p>
        </div>
      )}

      {/* Clips grid */}
      {clips.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} onClick={setSelectedClip} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
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
              You've reached the end of your clips
            </p>
          )}
        </>
      )}

      {/* Clip modal */}
      <ClipModal clip={selectedClip} onClose={() => setSelectedClip(null)} />
    </div>
  );
};

export default MyClipsPage;