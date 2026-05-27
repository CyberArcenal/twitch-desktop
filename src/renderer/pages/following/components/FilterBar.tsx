// src/renderer/pages/following/components/FilterBar.tsx
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { FilterOption, FollowingFilters, SortOption } from '../types';

interface FilterBarProps {
  filters: FollowingFilters;
  onFilterChange: <K extends keyof FollowingFilters>(key: K, value: FollowingFilters[K]) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const hasActiveFilters = filters.search !== '' || filters.status !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-[var(--card-secondary-bg)] rounded-xl">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search followed channels..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--input-text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value as FilterOption)}
        className="px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
      >
        <option value="all">All channels</option>
        <option value="live">Live now</option>
        <option value="offline">Offline</option>
      </select>

      {/* Sort dropdown */}
      <select
        value={filters.sortBy}
        onChange={(e) => onFilterChange('sortBy', e.target.value as SortOption)}
        className="px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
      >
        <option value="viewers">Sort by viewers (high to low)</option>
        <option value="name">Sort by name (A-Z)</option>
        <option value="followedAt">Sort by followed date (newest)</option>
      </select>

      {/* Reset button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--sidebar-text)] transition-colors"
        >
          <X className="w-4 h-4" />
          Reset
        </button>
      )}
    </div>
  );
};

export default FilterBar;