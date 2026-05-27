import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

interface FilterWordListProps {
  words: string[];
  onRemove: (word: string) => void;
}

const FilterWordList: React.FC<FilterWordListProps> = ({ words, onRemove }) => {
  if (words.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No blocked words yet</p>
        <p className="text-sm">Add words to filter from chat messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {words.map(word => (
        <div key={word} className="flex items-center gap-1 bg-[var(--card-secondary-bg)] rounded-full pl-3 pr-1 py-1 text-sm">
          <span className="text-[var(--sidebar-text)]">{word}</span>
          <button
            onClick={() => onRemove(word)}
            className="p-1 rounded-full hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-red-400 transition"
            title="Remove"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilterWordList;