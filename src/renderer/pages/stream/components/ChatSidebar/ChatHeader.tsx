// src/renderer/pages/stream/components/ChatSidebar/ChatHeader.tsx
import React from 'react';
import { Filter, Pause, Play } from 'lucide-react';

interface ChatHeaderProps {
  onToggleFilters: () => void;
  autoScrollPaused: boolean;
  onToggleAutoScroll: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleFilters,
  autoScrollPaused,
  onToggleAutoScroll,
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-[#2a2a2e] bg-[#1f1f23]">
      <h3 className="text-sm font-semibold text-white">Chat</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAutoScroll}
          className="p-1 hover:bg-[#2a2a2e] rounded transition-colors"
          aria-label={autoScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          title={autoScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
     {autoScrollPaused ? (
  <Play className="w-4 h-4 text-[#9147ff]" />
) : (
  <Pause className="w-4 h-4 text-[#adadb8]" />
)}
        </button>
        <button
          onClick={onToggleFilters}
          className="p-1 hover:bg-[#2a2a2e] rounded transition-colors"
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4 text-[#adadb8]" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;