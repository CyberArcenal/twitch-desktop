// src/renderer/pages/clips/index.tsx
import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useMyClips } from './hooks/useMyClips';
import MyClipCard from './components/MyClipCard';
import SearchBar from './components/SearchBar';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const MyClipsPage: React.FC = () => {
  const {
    clips,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadingMore,
    total,
    loadMore,
    refresh,
    deleteClip,
    copyLink,
    shareClip,
  } = useMyClips();

  if (loading && clips.length === 0) {
    return (
       <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load your clips</p>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">My Clips</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {total} clips • Created by you
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search your clips..." />
          <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Clips grid */}
      {clips.length === 0 && !loading && (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
          <p className="text-[var(--text-secondary)]">
            {searchQuery ? 'No clips match your search.' : "You haven't created any clips yet."}
          </p>
          {!searchQuery && (
            <p className="text-sm mt-2">Create clips from streams or VODs to see them here.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {clips.map((clip) => (
          <MyClipCard
            key={clip.id}
            clip={clip}
            onDelete={() => deleteClip(clip.id)}
            onCopyLink={() => copyLink(clip)}
            onShare={() => shareClip(clip)}
          />
        ))}
      </div>

      {/* Load More */}
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
    </div>
  );
};

export default MyClipsPage;