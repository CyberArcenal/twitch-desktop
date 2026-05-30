// src/renderer/pages/browse/categories/index.tsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useBrowseCategories } from './hooks/useBrowseCategories';
import CategoryCard from './components/CategoryCard';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const BrowseCategoriesPage: React.FC = () => {
  const { games, loading, error, total, refresh } = useBrowseCategories();

  if (loading) {
    return (
     <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load categories</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    // No max-w constraint – full width
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Browse Categories</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {total} games • Explore by category
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {/* Responsive grid: 2 (sm) → 3 (md) → 4 (lg) → 5 (xl) → 6 (2xl) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <CategoryCard key={game.id} game={game} />
        ))}
      </div>

      {/* Empty state (should not happen with 50 games, but just in case) */}
      {games.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No categories found.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseCategoriesPage;