// src/renderer/pages/stream/components/ChatSidebar/ChatFilterPanel.tsx
import React, { useRef, useState } from 'react';
import { X, AtSign, Trash2 } from 'lucide-react';

interface ChatFilterPanelProps {
  filters: string[];
  onAddFilter: (word: string) => void;
  onRemoveFilter: (word: string) => void;
  onClearAll: () => void;
}

const ChatFilterPanel: React.FC<ChatFilterPanelProps> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAddFilter(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="p-3 border-b border-[#2a2a2e] bg-[#18181b]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#adadb8] uppercase tracking-wider">Filtered Words</span>
        {filters.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap mb-3 min-h-[32px]">
        {filters.length === 0 ? (
          <span className="text-xs text-[#adadb8]/60 italic">No filters added</span>
        ) : (
          filters.map(f => (
            <span
              key={f}
              className="bg-[#9147ff]/20 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 text-white shadow-sm"
            >
              {f}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors"
                onClick={() => onRemoveFilter(f)}
              />
            </span>
          ))
        )}
      </div>

      {/* Input to add new filter */}
      <div className="relative">
        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adadb8]" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add word to filter (e.g., spam, !cmd)"
          className="w-full text-sm bg-[#0e0e10] border border-[#2a2a2e] rounded-lg pl-9 pr-3 py-2 text-white placeholder-[#adadb8] focus:outline-none focus:border-[#9147ff] transition-colors"
          onKeyPress={handleKeyPress}
        />
      </div>
      <p className="text-[10px] text-[#adadb8]/60 mt-2">
        Messages containing these words will be hidden. Case‑insensitive.
      </p>
    </div>
  );
};

export default ChatFilterPanel;