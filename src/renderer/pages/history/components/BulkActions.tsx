// src/renderer/pages/history/components/BulkActions.tsx
import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onClearAll: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount, onDeleteSelected, onClearAll }) => {
  if (selectedCount === 0) {
    return (
      <button
        onClick={onClearAll}
        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        Clear All History
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--text-secondary)]">
        {selectedCount} selected
      </span>
      <button
        onClick={onDeleteSelected}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Selected
      </button>
    </div>
  );
};

export default BulkActions;