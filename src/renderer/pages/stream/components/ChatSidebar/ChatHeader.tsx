import React from 'react';
import { Filter } from 'lucide-react';

interface ChatHeaderProps {
  onToggleFilters: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onToggleFilters }) => {
  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-[#2a2a2e] bg-[#1f1f23]">
      <h3 className="text-sm font-semibold text-white">Chat</h3>
      <button
        onClick={onToggleFilters}
        className="p-1 hover:bg-[#2a2a2e] rounded transition-colors"
        aria-label="Toggle filters"
      >
        <Filter className="w-4 h-4 text-[#adadb8]" />
      </button>
    </div>
  );
};

export default ChatHeader;