// src/renderer/pages/browse/live/components/FilterBar.tsx
import React from 'react';
import { Filter, X, Gamepad2, Languages } from 'lucide-react';
import type { Game } from '../../../../api/core/games';
import type { FilterState, LanguageOption } from '../types';

interface FilterBarProps {
  filters: FilterState;
  games: Game[];
  gamesLoading: boolean;
  languageOptions: LanguageOption[];
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  games,
  gamesLoading,
  languageOptions,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters = filters.gameId !== '' || filters.language !== '';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-[var(--card-secondary-bg)] rounded-xl">
      <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />

      {/* Game filter dropdown */}
      <div className="relative">
        <select
          value={filters.gameId}
          onChange={(e) => onFilterChange('gameId', e.target.value)}
          className="px-3 py-2 pl-8 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--input-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] appearance-none cursor-pointer"
          disabled={gamesLoading}
        >
          <option value="">All Games</option>
          {games.map(game => (
            <option key={game.id} value={game.id}>{game.name}</option>
          ))}
        </select>
        <Gamepad2 className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
      </div>

      {/* Language filter dropdown */}
      <div className="relative">
        <select
          value={filters.language}
          onChange={(e) => onFilterChange('language', e.target.value)}
          className="px-3 py-2 pl-8 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--input-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] appearance-none cursor-pointer"
        >
          {languageOptions.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
        <Languages className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
      </div>

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