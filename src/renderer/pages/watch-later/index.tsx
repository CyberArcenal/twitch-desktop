// src/renderer/pages/watch-later/index.tsx
import React from 'react';
import { RefreshCw, Trash2, Plus } from 'lucide-react';
import { useWatchLater } from './hooks/useWatchLater';
import SortableWatchLaterList from './components/SortableWatchLaterList';
import Button from '../../components/UI/Button';

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load Watch Later list</p>
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
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Watch Later</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <Button variant="danger" size="sm" onClick={clearAll} icon={Trash2}>
              Clear All
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && !loading && (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
          <Plus className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-lg font-medium text-[var(--sidebar-text)]">Your Watch Later list is empty</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
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