// src/renderer/pages/history/components/HistoryTable.tsx
import React from 'react';
import type { HistoryEntry } from '../../../api/core/history';
import HistoryTableRow from './HistoryTableRow';
import type { SortField, SortOrder } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, Clock } from 'lucide-react';

interface HistoryTableProps {
  entries: HistoryEntry[];
  selectedIds: Set<string>;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSort: (field: SortField) => void;
  onDelete: (id: string) => void;
  onAddToWatchLater: (entry: HistoryEntry) => void;
  onNavigate: (entry: HistoryEntry) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
  entries,
  selectedIds,
  sortField,
  sortOrder,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  onDelete,
  onAddToWatchLater,
  onNavigate,
}) => {
  const allSelected = entries.length > 0 && selectedIds.size === entries.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-3 p-3 border-b border-[var(--border-color)] bg-[var(--card-secondary-bg)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        <div className="flex-shrink-0 w-4">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
        </div>
        <div className="flex-shrink-0 w-16">Thumb</div>
        <div className="flex-1 flex items-center gap-1 cursor-pointer" onClick={() => onSort('channelName')}>
          Channel <SortIcon field="channelName" />
        </div>
        <div className="flex-1 flex items-center gap-1 cursor-pointer" onClick={() => onSort('title')}>
          Title <SortIcon field="title" />
        </div>
        <div className="flex-shrink-0 w-16 text-center">Duration</div>
        <div className="flex-shrink-0 w-32 flex items-center gap-1 cursor-pointer" onClick={() => onSort('watchedAt')}>
          Watched <SortIcon field="watchedAt" />
        </div>
        <div className="flex-shrink-0 w-24">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[var(--border-color)]">
        {entries.map((entry) => (
          <HistoryTableRow
            key={entry.id}
            entry={entry}
            isSelected={selectedIds.has(entry.id)}
            onToggleSelect={() => onToggleSelect(entry.id)}
            onDelete={() => onDelete(entry.id)}
            onAddToWatchLater={() => onAddToWatchLater(entry)}
            onNavigate={() => onNavigate(entry)}
          />
        ))}
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No watch history found.</p>
          <p className="text-sm mt-1">Watching streams or VODs will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;