// src/renderer/pages/watch-later/index.tsx
import React from 'react';
import { RefreshCw, Trash2, Plus } from 'lucide-react';
import { useWatchLater } from './hooks/useWatchLater';
import SortableWatchLaterList from './components/SortableWatchLaterList';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const WatchLaterPage: React.FC = () => {
  const {
    items,
    loading,
    error,
    removeItem,
    clearAll,
    markAsWatched,
    reorderItems,
    refresh,
  } = useWatchLater();

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading your watch later list..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-[#1f1f23] rounded-xl m-6">
        <p className="text-red-500 mb-2">Failed to load Watch Later list</p>
        <p className="text-sm text-[#adadb8]">{error}</p>
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Watch Later</h1>
          <p className="text-sm text-[#adadb8] mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <Button variant="danger" size="sm" onClick={clearAll} icon={Trash2}>
              Clear All
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            icon={RefreshCw}
            disabled={loading}
            className="bg-[#2a2a2e] hover:bg-[#3a3a4a] text-white border-none"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Empty state – glassmorphic */}
      {items.length === 0 && !loading && (
        <div className="text-center py-16 bg-gradient-to-br from-[#1f1f23] to-[#18181b] rounded-2xl border border-[#2a2a2e] shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0e0e10] flex items-center justify-center">
            <Plus className="w-8 h-8 text-[#adadb8]" />
          </div>
          <p className="text-lg font-semibold text-white">Your Watch Later list is empty</p>
          <p className="text-sm text-[#adadb8] mt-1 max-w-md mx-auto">
            Add streams, VODs, or clips from anywhere in the app to watch later.
          </p>
        </div>
      )}

      {/* Sortable list */}
      {items.length > 0 && (
        <SortableWatchLaterList
          items={items}
          onReorder={reorderItems}
          onRemove={removeItem}
          onMarkAsWatched={markAsWatched}
        />
      )}
    </div>
  );
};

export default WatchLaterPage;