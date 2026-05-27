// src/renderer/pages/history/index.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useWatchHistory } from './hooks/useWatchHistory';
import HistoryTable from './components/HistoryTable';
import SearchBar from './components/SearchBar';
import BulkActions from './components/BulkActions';
import Button from '../../components/UI/Button';

const WatchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    entries,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedIds,
    sortField,
    sortOrder,
    toggleSort,
    deleteEntry,
    deleteSelected,
    clearAll,
    toggleSelect,
    toggleSelectAll,
    addToWatchLater,
    refresh,
  } = useWatchHistory();

  const handleNavigate = (entry: any) => {
    if (entry.type === 'stream') {
      navigate(`/channel/${entry.channelName}`);
    } else if (entry.vodId) {
      navigate(`/vod/${entry.vodId}`);
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load watch history</p>
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
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Watch History</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {entries.length} entries • Last 30 days
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Bulk actions bar */}
      <div className="flex justify-between items-center mb-4">
        <BulkActions
          selectedCount={selectedIds.size}
          onDeleteSelected={deleteSelected}
          onClearAll={clearAll}
        />
      </div>

      {/* History table */}
      <HistoryTable
        entries={entries}
        selectedIds={selectedIds}
        sortField={sortField}
        sortOrder={sortOrder}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onSort={toggleSort}
        onDelete={deleteEntry}
        onAddToWatchLater={addToWatchLater}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default WatchHistoryPage;