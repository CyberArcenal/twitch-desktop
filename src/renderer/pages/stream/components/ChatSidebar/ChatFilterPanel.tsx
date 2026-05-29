import React, { useRef } from 'react';
import { X, AtSign } from 'lucide-react';

interface ChatFilterPanelProps {
  filters: string[];
  onAddFilter: (word: string) => void;
  onRemoveFilter: (word: string) => void;
}

const ChatFilterPanel: React.FC<ChatFilterPanelProps> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      onAddFilter(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  return (
    <div className="p-2 border-b border-[#2a2a2e] bg-[#18181b]">
      {/* Filter chips */}
      <div className="flex gap-1 flex-wrap mb-2">
        {filters.map(f => (
          <span
            key={f}
            className="bg-[#9147ff]/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-white"
          >
            {f}
            <X
              className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors"
              onClick={() => onRemoveFilter(f)}
            />
          </span>
        ))}
      </div>

      {/* Input to add new filter */}
      <div className="relative">
        <AtSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adadb8]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Filter words (e.g., spam)"
          className="w-full text-sm bg-[#0e0e10] border border-[#2a2a2e] rounded pl-8 pr-2 py-1 text-white focus:outline-none focus:border-[#9147ff] transition-colors"
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default ChatFilterPanel;