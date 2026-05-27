// src/renderer/pages/browse/top-games/index.tsx
import React, { useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useTopGames } from './hooks/useTopGames';
import TopGameCard from './components/TopGameCard';
import Button from '../../../components/UI/Button';

const TopGamesPage: React.FC = () => {
  const { games, loading, loadingMore, error, hasMore, loadInitial, loadMore } = useTopGames();

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  if (loading && games.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load top games</p>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Top Games</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Ranked by current live viewers • {games.length} games loaded
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadInitial} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <TopGameCard key={game.gameId} game={game} />
        ))}
      </div>

      {/* Load More button */}
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
            {loadingMore ? 'Loading...' : 'Load More Games'}
          </Button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && games.length > 0 && (
        <p className="text-center text-sm text-[var(--text-tertiary)] mt-8">
          You've reached the top {games.length} games
        </p>
      )}
    </div>
  );
};

export default TopGamesPage;