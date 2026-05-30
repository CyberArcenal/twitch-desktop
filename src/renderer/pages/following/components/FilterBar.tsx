// src/renderer/pages/following/components/FilterBar.tsx
import React from 'react';
import { Search, X } from 'lucide-react';
import type { FollowingFilters } from '../types';

interface FilterBarProps {
  filters: FollowingFilters;
  onFilterChange: <K extends keyof FollowingFilters>(key: K, value: FollowingFilters[K]) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const hasActiveFilters = filters.search !== '' || filters.status !== 'all';

  return (
    <div className="bg-[#1f1f23]/80 backdrop-blur-sm rounded-xl p-3 mb-6 border border-[#2a2a2e] shadow-lg">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adadb8]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search followed channels..."
            className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg pl-9 pr-3 py-2 text-white placeholder-[#adadb8] focus:outline-none focus:border-[#9147ff] transition-colors"
          />
        </div>

        {/* Status filter (segmented) */}
        <div className="flex gap-1 bg-[#0e0e10] rounded-lg p-0.5">
          {(['all', 'live', 'offline'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange('status', status)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                filters.status === status
                  ? 'bg-[#9147ff] text-white shadow-md'
                  : 'text-[#adadb8] hover:text-white hover:bg-[#2a2a2e]'
              }`}
            >
              {status === 'all' ? 'All' : status === 'live' ? 'Live' : 'Offline'}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value as any)}
          className="bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9147ff]"
        >
          <option value="viewers">Sort by: Viewers</option>
          <option value="name">Sort by: Name</option>
          <option value="followedAt">Sort by: Recently Followed</option>
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-[#adadb8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;